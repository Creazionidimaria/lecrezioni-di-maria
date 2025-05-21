const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'info.mariacreazioni@gmail.com',
    pass: 'ptjj htmp awxw pkck',
  }
});

// Funzione per creare PDF come stream
function creaPDF(ordine, totale, nomeCliente, emailCliente) {
  const doc = new PDFDocument();
  const stream = new Readable();
  stream._read = () => {};

  doc.pipe(stream);

  doc.fontSize(20).text('📦 Riepilogo Ordine - Le Creazioni di Maria', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`👤 Cliente: ${nomeCliente}`);
  doc.text(`📧 Email: ${emailCliente}`);
  doc.moveDown();

  doc.fontSize(16).text('👜 Dettagli ordine:');
  ordine.forEach(a => {
    doc.text(`• ${a.nome}${a.colore ? ' (Colore: ' + a.colore + ')' : ''} - €${a.prezzo.toFixed(2)}`);
  });

  doc.moveDown();
  doc.fontSize(16).text(`💰 Totale: €${totale}`);
  doc.end();

  return doc;
}

app.post('/send-order', (req, res) => {
  const { ordine, totale, payerName, payerEmail } = req.body;

  if (!ordine || !totale || !payerName || !payerEmail) {
    return res.status(400).json({ message: 'Dati ordine incompleti' });
  }

  const dettagliHTML = ordine.map(a =>
    `<li>👜 <strong>${a.nome}</strong>${a.colore ? ' (Colore: ' + a.colore + ')' : ''} — €${a.prezzo.toFixed(2)}</li>`
  ).join('');

  const pdfStream = creaPDF(ordine, totale, payerName, payerEmail);

  const commonFields = {
    from: '"Le Creazioni di Maria" <info.mariacreazioni@gmail.com>',
    attachments: [{
      filename: `ricevuta-${payerName}.pdf`,
      content: pdfStream
    }]
  };

  // Email a Maria
  const mailToVenditore = {
    ...commonFields,
    to: 'info.mariacreazioni@gmail.com',
    subject: `🆕 Nuovo ordine da ${payerName} 🛍️`,
    html: `
      <h2>🎁 Nuovo ordine ricevuto!</h2>
      <p><strong>Cliente:</strong> ${payerName}<br>
      <strong>Email:</strong> ${payerEmail}</p>

      <h3>🛍️ Dettagli ordine:</h3>
      <ul>${dettagliHTML}</ul>

      <p><strong>💶 Totale:</strong> €${totale}</p>
      <p>📦 PDF allegato con riepilogo.<br>✨ Buon lavoro!</p>
    `
  };

  // Email al cliente
  const mailToCliente = {
    ...commonFields,
    to: payerEmail,
    subject: '✅ Conferma ordine - Le Creazioni di Maria 🎉',
    html: `
      <h2>🌸 Ciao ${payerName}!</h2>
      <p>Grazie per il tuo acquisto da <strong>Le Creazioni di Maria</strong> 🧶</p>

      <h3>🧵 Riepilogo del tuo ordine:</h3>
      <ul>${dettagliHTML}</ul>

      <p><strong>Totale pagato:</strong> €${totale}</p>
      <p>📎 In allegato trovi la tua ricevuta in PDF.</p>

      <p>Grazie ancora e a presto! 💖</p>
    `
  };

  transporter.sendMail(mailToVenditore, (err) => {
    if (err) {
      console.error('Errore email a Maria:', err);
      return res.status(500).json({ message: 'Errore invio email a Maria' });
    }

    transporter.sendMail(mailToCliente, (err2) => {
      if (err2) {
        console.error('Errore email cliente:', err2);
        return res.status(200).json({ message: 'Ordine ricevuto, ma email cliente fallita' });
      }

      res.status(200).json({ message: 'Ordine e email con PDF inviati con successo!' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
