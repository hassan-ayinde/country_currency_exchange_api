// src/models/meta.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Meta', {
    key: { type: DataTypes.STRING, primaryKey: true },
    value: { type: DataTypes.TEXT }
  }, {
    tableName: 'meta',
    timestamps: false
  });
};
