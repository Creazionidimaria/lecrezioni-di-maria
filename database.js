const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// Modello Cliente
const Cliente = sequelize.define('Cliente', {
  nomeCliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emailCliente: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  freezeTableName: true
});

// Modello Ordine
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
    type: DataTypes.TEXT, // Salviamo array prodotti come JSON stringa
    allowNull: false
  },
  totale: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  freezeTableName: true
});

// Modello Utente (opzionale)
const Utente = sequelize.define('Utente', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  freezeTableName: true
});

module.exports = { sequelize, Cliente, Ordine, Utente };
