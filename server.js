const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize, Ordine } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Sincronizza DB
sequelize.sync()
  .then(() => console.log('Database sincronizzato'))
  .catch(err => console.error('Errore sincronizzazione DB:', err));

// API per salvare ordine
app.post('/api/ordini', async (req, res) => {
  try {
    const { nomeCliente, emailCliente, prodotti, totale } = req.body;

    if (!nomeCliente || !emailCliente || !prodotti || !totale) {
      return res.status(400).json({ message: 'Campi mancanti' });
    }

    // prodotti è un array, lo salviamo come stringa JSON
    const ordine = await Ordine.create({
      nomeCliente,
      emailCliente,
      prodotti: JSON.stringify(prodotti),
      totale
    });

    res.status(201).json({ message: 'Ordine salvato con successo', ordine });
  } catch (error) {
    console.error('Errore salvataggio ordine:', error);
    res.status(500).json({ message: 'Errore server' });
  }
});

// Serve index.html e file statici se vuoi (opzionale)
// app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});


