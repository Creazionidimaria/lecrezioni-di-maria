const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Configura il trasportatore SMTP con i tuoi dati reali (Gmail con password per app)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'info.mariacreazioni@gmail.com',    // tua email reale
    pass: 'ptjj htmp awxw pkck',              // password per app generata da Google
  }
});

app.post('/send-order', (req, res) => {
  console.log('Ricevuto ordine:', JSON.stringify(req.body, null, 2));

  const { ordine, totale, payerName, payerEmail } = req.body;

  if (!ordine || !totale || !payerName || !payerEmail) {
    return res.status(400).json({ message: 'Dati ordine incompleti' });
  }

  const dettagliOrdine = ordine
    .map(a => `👜 *${a.nome}*${a.colore ? ' (Colore: ' + a.colore + ')' : ''} — Prezzo: 💶 €${a.prezzo.toFixed(2)}`)
    .join('\n');

  // Email al venditore
  const mailToVenditore = {
    from: '"Le Creazioni di Maria" <info.mariacreazioni@gmail.com>',
    to: 'info.mariacreazioni@gmail.com',
    subject: `🆕 Nuovo ordine da ${payerName} 🛍️`,
    text: `Ciao Maria! 👋

Hai ricevuto un nuovo ordine dal cliente:

👤 Nome: ${payerName}
📧 Email: ${payerEmail}

📦 Dettaglio ordine:
${dettagliOrdine}

💰 Totale: €${totale}

Controlla e prepara la spedizione. Buon lavoro! 🚚✨
`
  };

  // Email al cliente
  const mailToCliente = {
    from: '"Le Creazioni di Maria" <info.mariacreazioni@gmail.com>',
    to: payerEmail,
    subject: '✅ Conferma ordine - Le Creazioni di Maria 🎉',
    text: `Ciao ${payerName}! 😊

Grazie mille per il tuo acquisto! Ecco il riepilogo del tuo ordine:

${dettagliOrdine}

Totale pagato: 💶 €${totale}

📬 Ti contatteremo presto per i dettagli della spedizione.

Se hai domande, rispondi a questa email.

Buona giornata e grazie per aver scelto Le Creazioni di Maria! 🌸🧶
`
  };

  transporter.sendMail(mailToVenditore, (err, info) => {
    if (err) {
      console.error('Errore invio email al venditore:', err);
      return res.status(500).json({ message: 'Errore invio email al venditore' });
    }

    transporter.sendMail(mailToCliente, (err2, info2) => {
      if (err2) {
        console.error('Errore invio email al cliente:', err2);
        return res.status(200).json({ message: 'Ordine ricevuto, ma errore invio email al cliente' });
      }

      res.status(200).json({ message: 'Ordine e email inviati con successo' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
