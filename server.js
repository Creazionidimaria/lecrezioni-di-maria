const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post('/invia-email', (req, res) => {
  const { emailCliente, carrello, totale } = req.body;

  // Crea PDF
  const doc = new PDFDocument();
  const nomeFile = `ricevuta_${Date.now()}.pdf`;
  const filePath = path.join(__dirname, nomeFile);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);
  doc.fontSize(20).text("Le Creazioni di Maria 🧶", { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Totale: €${totale.toFixed(2)}`);
  doc.moveDown().text("Dettagli ordine:");
  carrello.forEach(item => {
    doc.text(`- ${item.nome} - €${item.prezzo.toFixed(2)}`);
  });
  doc.end();

  stream.on('finish', () => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info.mariacreazioni@gmail.com', // ⚠️ CAMBIA QUI
        pass: 'ptjj htmp awxw pkck'    // ⚠️ CAMBIA QUI
      }
    });

    const mailOptions = {
      from: '"Le Creazioni di Maria" <info.mariacreazioni@gmail.com>',
      to: [emailCliente, 'info.mariacreazioni@gmail.com'],
      subject: 'Conferma Ordine - Le Creazioni di Maria 🧶',
      text: `Grazie per il tuo acquisto! In allegato trovi la ricevuta PDF. Totale: €${totale.toFixed(2)}`,
      attachments: [{
        filename: 'ricevuta.pdf',
        path: filePath
      }]
    };

    transporter.sendMail(mailOptions, (err, info) => {
      fs.unlinkSync(filePath); // Elimina il PDF dopo l'invio
      if (err) {
        console.error(err);
        return res.json({ success: false });
      }
      res.json({ success: true });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
