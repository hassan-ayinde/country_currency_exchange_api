// src/models/index.js
const { Sequelize } = require('sequelize');
const CountryModel = require('./country');
const MetaModel = require('./meta');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

const Country = CountryModel(sequelize);
const Meta = MetaModel(sequelize);

const sync = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('DB synced');
  } catch (err) {
    console.error('Failed to sync DB', err);
    process.exit(1);
  }
};

if (require.main === module) {
  // run when called as script: npm run sync-db
  sync();
}

module.exports = { sequelize, Country, Meta, sync };
