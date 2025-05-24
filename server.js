const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // se metti index.html in ./public

// Setup DB SQLite
const db = new sqlite3.Database('./ordini.sqlite', (err) => {
  if (err) {
    console.error('Errore apertura DB', err.message);
  } else {
    console.log('DB SQLite connesso');
    db.run(`CREATE TABLE IF NOT EXISTS ordini (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_cliente TEXT,
      ordine TEXT,
      totale REAL,
      paypal_order_id TEXT,
      data_ordine DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Errore creazione tabella', err.message);
      }
    });
  }
});

// Setup nodemailer - usa un account gmail ad esempio
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'info.mariacreazioni@gmail.com',       // metti la tua email reale
    pass: 'empc jqfl uoid mzey'                  // metti la password app (non la normale)
  }
});

// POST per ricevere l'ordine dal client
app.post('/invia-ordine', (req, res) => {
  const { carrello, totale, email, paypalOrderId } = req.body;

  if (!email || !carrello || carrello.length === 0) {
    return res.json({ success: false, msg: 'Dati mancanti' });
  }

  // Salva ordine nel DB (carrello JSON.stringify)
  const ordineString = JSON.stringify(carrello, null, 2);

  db.run(`INSERT INTO ordini (email_cliente, ordine, totale, paypal_order_id) VALUES (?, ?, ?, ?)`,
    [email, ordineString, totale, paypalOrderId],
    function (err) {
      if (err) {
        console.error('Errore inserimento DB', err.message);
        return res.json({ success: false, msg: 'Errore DB' });
      }

      // Invia email a cliente e a te stesso
      const mailOptionsCliente = {
        from: 'info.mariacreazioni@gmail.com',
        to: email,
        subject: 'Conferma ordine Le Creazioni di Maria',
        html: `<h2>Grazie per il tuo ordine!</h2>
               <p>Totale: €${totale.toFixed(2)}</p>
               <pre>${ordineString}</pre>`
      };
      const mailOptionsVenditore = {
        from: 'info.mariacreazioni@gmail.com',
        to: 'info.mariacreazioni@gmail.com',
        subject: 'Nuovo ordine ricevuto',
        html: `<h2>Nuovo ordine da ${email}</h2>
               <p>Totale: €${totale.toFixed(2)}</p>
               <pre>${ordineString}</pre>`
      };

      transporter.sendMail(mailOptionsCliente, (error, info) => {
        if (error) {
          console.error('Errore email cliente', error);
          // anche se fallisce email cliente, continuiamo
        }
        transporter.sendMail(mailOptionsVenditore, (error2, info2) => {
          if (error2) {
            console.error('Errore email venditore', error2);
          }
          res.json({ success: true, msg: 'Ordine salvato e email inviate' });
        });
      });
    });
});

app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
