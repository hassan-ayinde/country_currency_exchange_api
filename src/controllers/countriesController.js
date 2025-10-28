// src/controllers/countriesController.js
const { Country, Meta } = require('../models/index');
const { refreshAll } = require('../services/refreshService');
const { IMAGE_PATH } = require('../utils/imageGenerator');
const fs = require('fs');

const BAD_REQ = (details) => ({ status: 400, body: { error: 'Validation failed', details } });

function validateCountryRequired(obj) {
  const errors = {};
  if (!obj.name) errors.name = 'is required';
  if (obj.population == null) errors.population = 'is required';
  if (!obj.currency_code) errors.currency_code = 'is required';
  return Object.keys(errors).length === 0 ? null : errors;
}

async function postRefresh(req, res) {
  try {
    const result = await refreshAll();
    return res.json({ success: true, total_countries: result.total, last_refreshed_at: result.last_refreshed_at });
  } catch (err) {
    if (err.message === 'External data source unavailable' || err.details) {
      return res.status(503).json({ error: 'External data source unavailable', details: err.details || err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCountries(req, res) {
  try {
    const { region, currency, sort } = req.query;
    const where = {};
    if (region) where.region = region;
    if (currency) where.currency_code = currency;

    const order = [];
    if (sort === 'gdp_desc') order.push(['estimated_gdp', 'DESC']);
    else if (sort === 'gdp_asc') order.push(['estimated_gdp', 'ASC']);
    else order.push(['id', 'ASC']);

    const countries = await Country.findAll({ where, order });
    return res.json(countries.map(c => c.toJSON()));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCountryByName(req, res) {
  try {
    const name = req.params.name;
    const country = await Country.findOne({
      where: Country.sequelize.where(
        Country.sequelize.fn('lower', Country.sequelize.col('name')),
        name.toLowerCase()
      )
    });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    return res.json(country);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteCountryByName(req, res) {
  try {
    const name = req.params.name;
    const country = await Country.findOne({
      where: Country.sequelize.where(
        Country.sequelize.fn('lower', Country.sequelize.col('name')),
        name.toLowerCase()
      )
    });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    await country.destroy();
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getStatus(req, res) {
  try {
    const total = await Country.count();
    const meta = await Meta.findByPk('last_refreshed_at');
    const last = meta ? meta.value : null;
    return res.json({ total_countries: total, last_refreshed_at: last });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getImage(req, res) {
  try {
    if (!fs.existsSync(IMAGE_PATH)) {
      return res.status(404).json({ error: 'Summary image not found' });
    }
    return res.sendFile(require('path').resolve(IMAGE_PATH));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  postRefresh,
  getCountries,
  getCountryByName,
  deleteCountryByName,
  getStatus,
  getImage
};
