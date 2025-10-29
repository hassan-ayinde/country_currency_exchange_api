// src/models/index.js
const { Sequelize } = require("sequelize");
const CountryModel = require("./country");
const MetaModel = require("./meta");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.MYSQLNAME,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT || 3306,
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
    console.log("✅ MySQL DB connected and synced successfully");
  } catch (err) {
    console.error("❌ Failed to connect to MySQL:", err);
    process.exit(1);
  }
};

if (require.main === module) {
  sync();
}

module.exports = { sequelize, Country, Meta, sync };
