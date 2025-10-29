// src/services/refreshService.js
const axios = require("axios");
// require the models module object so we pick up runtime replacements (sqlite fallback)
const models = require("../models/index");
const { generateSummaryImage } = require("../utils/imageGenerator");
require("dotenv").config();

const COUNTRIES_API = process.env.EXTERNAL_COUNTRIES_API;
const RATES_API = process.env.EXTERNAL_RATES_API;
const TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT_MS || "10000", 10);

function randMultiplier() {
  // random between 1000 and 2000 inclusive
  return Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
}

async function fetchExternalData() {
  // fetch both; if either fails, throw
  const axiosInst = axios.create({ timeout: TIMEOUT });
  let countriesRes, ratesRes;
  try {
    countriesRes = await axiosInst.get(COUNTRIES_API);
  } catch (err) {
    const e = new Error("Could not fetch data from Countries API");
    e.api = "Countries";
    throw e;
  }
  try {
    ratesRes = await axiosInst.get(RATES_API);
  } catch (err) {
    const e = new Error("Could not fetch data from Rates API");
    e.api = "Rates";
    throw e;
  }
  return { countries: countriesRes.data, ratesData: ratesRes.data };
}

async function refreshAll() {
  const t = await models.sequelize.transaction();
  try {
    const { countries, ratesData } = await fetchExternalData();
    const rates = ratesData && ratesData.rates ? ratesData.rates : {};

    const now = new Date();

    // For each country, transform into DB payload
    const processed = countries.map((c) => {
      const name = c.name;
      const capital = c.capital || null;
      const region = c.region || null;
      const population = c.population != null ? Number(c.population) : 0;
      const flag_url = c.flag || null;

      // extract first currency code if available
      let currency_code = null;
      if (
        Array.isArray(c.currencies) &&
        c.currencies.length > 0 &&
        c.currencies[0] &&
        c.currencies[0].code
      ) {
        currency_code = c.currencies[0].code;
      }

      let exchange_rate = null;
      let estimated_gdp = null;

      if (!currency_code) {
        exchange_rate = null;
        estimated_gdp = 0;
      } else {
        const rateVal = rates[currency_code];
        if (rateVal == null) {
          exchange_rate = null;
          estimated_gdp = null;
        } else {
          exchange_rate = Number(rateVal);
          const multiplier = randMultiplier();
          // population × random(1000–2000) ÷ exchange_rate
          estimated_gdp = (population * multiplier) / exchange_rate;
        }
      }

      return {
        name,
        capital,
        region,
        population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url,
        last_refreshed_at: now,
      };
    });

    // Upsert logic: match by name case-insensitive
    for (const p of processed) {
      const existing = await models.Country.findOne({
        where: models.sequelize.where(
          models.sequelize.fn("lower", models.sequelize.col("name")),
          models.sequelize.fn("lower", p.name)
        ),
        transaction: t,
      });
      if (existing) {
        // Update all fields on existing
        await existing.update(p, { transaction: t });
      } else {
        await models.Country.create(p, { transaction: t });
      }
    }

    // update meta last_refreshed_at
    await models.Meta.upsert(
      { key: "last_refreshed_at", value: new Date().toISOString() },
      { transaction: t }
    );

    // Commit DB changes before generating image
    await t.commit();

    // After saving, generate summary image
    // compute top5 by estimated_gdp (descending), ignore null/zero
    const allCountries = await models.Country.findAll();
    const total = allCountries.length;
    const top5 = allCountries
      .filter((c) => c.estimated_gdp !== null && c.estimated_gdp !== 0)
      .sort((a, b) => (b.estimated_gdp || 0) - (a.estimated_gdp || 0))
      .slice(0, 5)
      .map((c) => ({ name: c.name, estimated_gdp: c.estimated_gdp }));

    await generateSummaryImage({
      total,
      top5,
      timestamp: new Date().toISOString(),
    });

    return { total, last_refreshed_at: new Date().toISOString() };
  } catch (err) {
    // rollback if transaction still active
    try {
      await t.rollback();
    } catch (e) {}
    if (err.api) {
      const ex = new Error("External data source unavailable");
      ex.details = `Could not fetch data from ${err.api} API`;
      throw ex;
    }
    throw err;
  }
}

module.exports = { refreshAll };
