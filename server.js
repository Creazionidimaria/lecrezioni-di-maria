// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Configura il client PayPal
const environment = new paypal.core.LiveEnvironment('IL_TUO_CLIENT_ID', 'IL_TUO_CLIENT_SECRET');
const client = new paypal.core.PayPalHttpClient(environment);

// ✅ Crea ordine
app.post('/create-order', async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'EUR',
        value: req.body.totale
      }
    }]
  });

  try {
    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    res.status(500).send(err);
  }
});

// ✅ Cattura pagamento
app.post('/capture-order', async (req, res) => {
  const orderId = req.body.orderID;
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    
    // ✅ Dopo il pagamento, invia su WhatsApp
    const articoli = req.body.articoli;
    const messaggio = encodeURIComponent(
      `✅ NUOVO ORDINE PAGATO:\n` +
      articoli.map(a => `${a.nome} (${a.colore}) - ${a.prezzo}€`).join('\n') +
      `\nTotale: ${req.body.totale}€`
    );
    const numero = '393398952949';
    const waLink = `https://wa.me/${numero}?text=${messaggio}`;

    res.json({ success: true, link: waLink });

  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`✅ Server attivo su http://localhost:${port}`);
});
