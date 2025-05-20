const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // body parser integrato
app.use(express.static('public')); // Cartella per index.html e risorse statiche

// Configura il trasportatore SMTP con i tuoi dati reali (Gmail con password per app)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'info.mariacreazioni@gmail.com',     // tua email reale
    pass: 'ptjj htmp awxw pkck',  // password per app generata da Google
  }
});

// Endpoint per ricevere ordine e inviare email
app.post('/send-order', (req, res) => {
  console.log('Ricevuto ordine:', req.body);

  const { ordine, totale, payerName, payerEmail } = req.body;

  if (!ordine || !totale || !payerName || !payerEmail) {
    return res.status(400).json({ message: 'Dati ordine incompleti' });
  }

  // Crea riepilogo ordine in formato testo
  const dettagliOrdine = ordine
    .map(a => `${a.nome} - Colore: ${a.colore} - Prezzo: €${a.prezzo.toFixed(2)}`)
    .join('\n');

  // Email da inviare al venditore
  const mailToVenditore = {
    from: '"Le Creazioni di Maria" <info.mariacreazioni@gmail.com>',
    to: 'info.mariacreazioni@gmail.com',
    subject: `Nuovo ordine da ${payerName}`,
    text: `Hai ricevuto un nuovo ordine.\n\nCliente: ${payerName}\nEmail cliente: ${payerEmail}\n\nOrdine:\n${dettagliOrdine}\n\nTotale: €${totale}`
  };

  // Email da inviare al cliente per conferma
  const mailToCliente = {
    from: '"Le Creazioni di Maria" <info.mariacreazioni@gmail.com>',
    to: payerEmail,
    subject: 'Conferma ordine - Le Creazioni di Maria',
    text: `Ciao ${payerName},\n\nGrazie per il tuo acquisto! Ecco il riepilogo del tuo ordine:\n\n${dettagliOrdine}\n\nTotale pagato: €${totale}\n\nTi contatteremo presto per la spedizione.\n\nBuona giornata!\nLe Creazioni di Maria`
  };

  // Invia email al venditore
  transporter.sendMail(mailToVenditore, (err, info) => {
    if (err) {
      console.error('Errore invio email al venditore:', err);
      return res.status(500).json({ message: 'Errore invio email al venditore' });
    }

    // Se email al venditore è andata, invia conferma al cliente
    transporter.sendMail(mailToCliente, (err2, info2) => {
      if (err2) {
        console.error('Errore invio email al cliente:', err2);
        return res.status(200).json({ message: 'Ordine ricevuto, ma errore invio email al cliente' });
      }

      // Tutto ok
      res.status(200).json({ message: 'Ordine e email inviati con successo' });
    });
  });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
