const { Sequelize, DataTypes } = require('sequelize');

// Crea il DB SQLite nel file database.sqlite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false // disabilita log SQL (opzionale)
});

// Definisci il modello Ordine
const Ordine = sequelize.define('Ordine', {
  nomeCliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emailCliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prodotti: {
    type: DataTypes.TEXT, // Salviamo JSON come stringa
    allowNull: false
  },
  totale: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  dataOrdine: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = { sequelize, Ordine };
