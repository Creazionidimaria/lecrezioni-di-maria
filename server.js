const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize, Cliente, Ordine, Utente } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Sincronizza DB (crea tabelle se non ci sono)
sequelize.sync()
  .then(() => console.log('Database sincronizzato'))
  .catch(err => console.error('Errore sincronizzazione DB:', err));

// API per salvare cliente (se vuoi inserirlo direttamente)
app.post('/api/clienti', async (req, res) => {
  try {
    const { nomeCliente, emailCliente } = req.body;
    if (!nomeCliente || !emailCliente) {
      return res.status(400).json({ message: 'Nome o email mancanti' });
    }

    // Prova a creare, se email esiste risponde errore
    const cliente = await Cliente.create({ nomeCliente, emailCliente });
    res.status(201).json({ message: 'Cliente salvato con successo', cliente });
  } catch (error) {
    console.error('Errore salvataggio cliente:', error);
    res.status(500).json({ message: 'Errore server' });
  }
});

// API per salvare ordine
app.post('/api/ordini', async (req, res) => {
  try {
    const { nomeCliente, emailCliente, prodotti, totale } = req.body;

    if (!nomeCliente || !emailCliente || !prodotti || !totale) {
      return res.status(400).json({ message: 'Campi mancanti' });
    }

    // Salvo ordine
    const ordine = await Ordine.create({
      nomeCliente,
      emailCliente,
      prodotti: JSON.stringify(prodotti),
      totale
    });

    // Controllo se cliente esiste già, altrimenti lo creo
    let cliente = await Cliente.findOne({ where: { emailCliente } });
    if (!cliente) {
      cliente = await Cliente.create({ nomeCliente, emailCliente });
    }

    res.status(201).json({ message: 'Ordine salvato con successo', ordine });
  } catch (error) {
    console.error('Errore salvataggio ordine:', error);
    res.status(500).json({ message: 'Errore server' });
  }
});

// API per salvare utente
app.post('/api/utenti', async (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ message: 'Campi mancanti' });
    }

    const utente = await Utente.create({ nome, email });
    res.status(201).json({ message: 'Utente salvato con successo', utente });
  } catch (error) {
    console.error('Errore salvataggio utente:', error);
    res.status(500).json({ message: 'Errore server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
