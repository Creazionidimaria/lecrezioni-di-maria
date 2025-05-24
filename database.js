const { Sequelize, DataTypes } = require('sequelize');

// Crea un database SQLite in file 'database.sqlite'
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// Definisci il modello Ordine (tabella)
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
    type: DataTypes.TEXT, // salva JSON come stringa
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
