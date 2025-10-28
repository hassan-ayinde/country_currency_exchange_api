// src/models/index.js
const { Sequelize } = require("sequelize");
const CountryModel = require("./country");
const MetaModel = require("./meta");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

const Country = CountryModel(sequelize);
const Meta = MetaModel(sequelize);

const sync = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("DB synced");
    return true;
  } catch (err) {
    console.error("Failed to sync DB", err);
    // Return false so the caller can decide how to proceed (don't exit here)
    return false;
  }
};

if (require.main === module) {
  // run when called as script: npm run sync-db
  // keep previous behavior of exiting with non-zero code when sync fails
  sync().then((ok) => {
    if (!ok) process.exit(1);
  });
}

module.exports = { sequelize, Country, Meta, sync };
