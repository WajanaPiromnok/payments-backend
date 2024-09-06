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

        const landingPageUrl = '/index.html';
        res.redirect(landingPageUrl);

    } catch (error) {
        console.error('Error forwarding request:', error.message);
        console.error('Error Details:', error.response?.data || 'No further details available');
        res.status(500).send({ 
            error: 'Internal Server Error', 
            details: error.response?.data || error.message 
        });
    }
});

app.post('/codapay/notification', (req, res) => {
    try {
        // Log the entire request body for debugging purposes
        console.log('Received notification:', req.body);

        // Extract necessary fields from Codapay's request
        const { payout_id, request_id, request_amount, target_amount, payout_status } = req.body;

        // Log or store the payment details as needed
        console.log('Payout ID:', payout_id);
        console.log('Request ID:', request_id);
        console.log('Payout Status:', payout_status);

        // You can save this information to a database or perform additional actions

        // Send a response back to Codapay
        res.status(200).send({ message: 'Notification received successfully' });
    } catch (error) {
        console.error('Error processing notification:', error);
        res.status(500).send({ error: 'Failed to process notification' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
