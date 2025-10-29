const { Sequelize } = require("sequelize");
const CountryModel = require("./country");
const MetaModel = require("./meta");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: "mysql",
    logging: false,
  }
);

const Country = CountryModel(sequelize);
const Meta = MetaModel(sequelize);

const sync = async () => {
  try {
    console.log("🔌 Connecting to:", {
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      db: process.env.MYSQLDATABASE,
    });

    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ DB synced successfully");
  } catch (err) {
    console.error("❌ Failed to sync DB", err);
    process.exit(1);
  }
};

if (require.main === module) {
  sync();
}

module.exports = { sequelize, Country, Meta, sync };
