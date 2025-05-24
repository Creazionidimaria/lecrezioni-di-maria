const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const { sequelize, Ordine } = require('./database');  // importa il DB e modello

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // se index.html è in ./public

// Connessione e sincronizzazione DB Sequelize
sequelize.sync()
  .then(() => console.log('DB Sequelize connesso e sincronizzato'))
  .catch(err => console.error('Errore DB Sequelize:', err));

// Setup nodemailer - usa un account gmail ad esempio
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'info.mariacreazioni@gmail.com',  // la tua email reale
    pass: 'empc jqfl uoid mzey'             // password app Google
  }
});

// POST per ricevere l'ordine dal client
app.post('/invia-ordine', async (req, res) => {
  try {
    const { carrello, totale, email, paypalOrderId } = req.body;

    if (!email || !carrello || carrello.length === 0) {
      return res.json({ success: false, msg: 'Dati mancanti' });
    }

    const ordineString = JSON.stringify(carrello, null, 2);

    // Salva ordine nel DB usando Sequelize
    const nuovoOrdine = await Ordine.create({
      nomeCliente: 'Cliente',  // opzionale se vuoi aggiungere nome
      emailCliente: email,
      prodotti: ordineString,
      totale: parseFloat(totale),
      dataOrdine: new Date()
    });

    // Prepara email a cliente
    const mailOptionsCliente = {
      from: 'info.mariacreazioni@gmail.com',
      to: email,
      subject: 'Conferma ordine Le Creazioni di Maria',
      html: `<h2>Grazie per il tuo ordine!</h2>
             <p>Totale: €${totale.toFixed(2)}</p>
             <pre>${ordineString}</pre>`
    };

    // Prepara email a venditore
    const mailOptionsVenditore = {
      from: 'info.mariacreazioni@gmail.com',
      to: 'info.mariacreazioni@gmail.com',
      subject: 'Nuovo ordine ricevuto',
      html: `<h2>Nuovo ordine da ${email}</h2>
             <p>Totale: €${totale.toFixed(2)}</p>
             <pre>${ordineString}</pre>`
    };

    // Invia email cliente
    await transporter.sendMail(mailOptionsCliente);

    // Invia email venditore
    await transporter.sendMail(mailOptionsVenditore);

    // Risposta positiva al client
    res.json({ success: true, msg: 'Ordine salvato e email inviate' });

  } catch (error) {
    console.error('Errore nel POST /invia-ordine:', error);
    res.json({ success: false, msg: 'Errore interno server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
