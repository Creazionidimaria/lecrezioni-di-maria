const fs = require('fs');
const readline = require('readline');
const path = require('path');

const fileJson = path.join(__dirname, 'ordini.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔍 Inserisci codice ordine (5 cifre): ', (codice) => {
  if (!fs.existsSync(fileJson)) {
    console.log('❌ Nessun file ordini trovato.');
    return rl.close();
  }

  const dati = JSON.parse(fs.readFileSync(fileJson));

  const ordine = dati.find(o => o['Codice Ordine'] === codice);

  if (!ordine) {
    console.log('❌ Codice non trovato.');
  } else {
    console.log('✅ Ordine trovato:');
    console.log(`👤 Nome: ${ordine.Nome} ${ordine.Cognome}`);
    console.log(`📧 Email: ${ordine.Email}`);
    console.log(`👜 Articoli: ${ordine.Articoli}`);
    console.log(`💶 Totale: €${ordine.Totale}`);
    console.log(`📅 Data: ${ordine['Data Ordine']}`);
  }

  rl.close();
});
