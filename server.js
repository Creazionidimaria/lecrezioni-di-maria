const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const fileExcel = './ordini.xlsx';
const fileJson = './ordini.json';

// 🔹 Funzione per creare Excel se non esiste
function creaFileExcelSeNonEsiste() {
  if (!fs.existsSync(fileExcel)) {
    const ws = XLSX.utils.json_to_sheet([]);
    const wb = XLSX.utils.book_new();
    const headers = ['Codice Ordine', 'Nome', 'Cognome', 'Email', 'Articoli', 'Totale', 'Data Ordine'];
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
    XLSX.utils.book_append_sheet(wb, ws, 'Ordini');
    XLSX.writeFile(wb, fileExcel);
  }
}

// 🔹 Genera codice casuale a 5 cifre
function generaCodiceOrdine() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// 🔹 Salva ordine in JSON
function salvaOrdineJson(ordine) {
  let ordini = [];
  if (fs.existsSync(fileJson)) {
    const dati = fs.readFileSync(fileJson);
    ordini = JSON.parse(dati);
  }
  ordini.push(ordine);
  fs.writeFileSync(fileJson, JSON.stringify(ordini, null, 2));
}

// 🔹 Endpoint per ricevere ordine
app.post('/api/ordine', (req, res) => {
  const { nome, cognome, email, prodotti, totale } = req.body;

  if (!nome || !cognome || !email || !prodotti || !totale) {
    return res.status(400).send('Dati ordine incompleti');
  }

  const codiceOrdine = generaCodiceOrdine(); // Codice a 5 cifre
  const descrizioneProdotti = prodotti.map(p =>
    `${p.nome} x${p.quantita || 1}${p.colore ? ' (' + p.colore + ')' : ''}`
  ).join(', ');
  const dataOrdine = new Date().toISOString();

  const ordine = {
    'Codice Ordine': codiceOrdine,
    Nome: nome,
    Cognome: cognome,
    Email: email,
    Articoli: descrizioneProdotti,
    Totale: totale,
    'Data Ordine': dataOrdine
  };

  try {
    creaFileExcelSeNonEsiste();

    const wb = XLSX.readFile(fileExcel);
    const ws = wb.Sheets['Ordini'];
    const dati = XLSX.utils.sheet_to_json(ws);
    dati.push(ordine);

    const nuovoWs = XLSX.utils.json_to_sheet(dati, { header: ['Codice Ordine', 'Nome', 'Cognome', 'Email', 'Articoli', 'Totale', 'Data Ordine'] });
    wb.Sheets['Ordini'] = nuovoWs;
    XLSX.writeFile(wb, fileExcel);

    salvaOrdineJson(ordine); // anche su JSON

    res.status(200).send({ messaggio: 'Ordine salvato con successo', codiceOrdine });
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).send('Errore durante il salvataggio ordine');
  }
});

// 🔹 Avvia server
app.listen(port, () => {
  console.log(`✅ Server attivo su http://localhost:${port}`);
});

