// src/models/index.js
const { Sequelize } = require("sequelize");
const CountryModel = require("./country");
const MetaModel = require("./meta");
require("dotenv").config();

// Primary Sequelize (MySQL) configuration
let sequelize = new Sequelize(
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

let Country = CountryModel(sequelize);
let Meta = MetaModel(sequelize);

async function useSqliteFallback() {
  const sqlitePath = process.env.SQLITE_PATH || "cache/dev.sqlite";
  console.warn(`Falling back to SQLite at ${sqlitePath}`);
  const sqliteSequelize = new Sequelize({
    dialect: "sqlite",
    storage: sqlitePath,
    logging: false,
  });
  // re-init models on sqlite instance
  Country = CountryModel(sqliteSequelize);
  Meta = MetaModel(sqliteSequelize);

  // update exported references so callers that read module.exports later can see them
  module.exports.sequelize = sqliteSequelize;
  module.exports.Country = Country;
  module.exports.Meta = Meta;

  sequelize = sqliteSequelize;

  await sequelize.sync({ alter: true });
  console.log("SQLite DB synced");
}

const sync = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("DB synced");
    return true;
  } catch (err) {
    console.error("Failed to sync DB (MySQL)", err);
    try {
      // Try to fallback to sqlite for local/dev/test runs
      await useSqliteFallback();
      return true;
    } catch (e) {
      console.error("Failed to fallback to SQLite", e);
      return false;
    }
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