const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());

app.use(express.json());

app.post('/proxy', async (req, res) => {
    try {
        const response = await axios.post('https://sandbox.codapayments.com/airtime/api/restful/v1.0/Payment/init.json', req.body, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.status(response.status).send(response.data);
        console.log('Response Data:', response.data);
    } catch (error) {
        console.error('Request error:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/payment', async (req, res) => {
    try {
        const { txn_id } = req.body;

        if (!txn_id) {
            throw new Error('txn_id is missing from the request');
        }

        console.log('Transaction ID:', txn_id);

        const paymentUrl = `https://sandbox.codapayments.com/airtime/begin?txn_id=${txn_id}`;
        console.log('Generated Payment URL:', paymentUrl);

        // Send the payment URL back to Unity
        res.status(200).send({ paymentUrl });
    } catch (error) {
        console.error('Error forwarding request:', error.message);
        console.error('Error Details:', error.response?.data || 'No further details available');
        res.status(500).send({ 
            error: 'Internal Server Error', 
            details: error.response?.data || error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
