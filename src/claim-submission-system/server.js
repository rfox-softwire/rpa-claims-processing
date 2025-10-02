const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit-claim', async (req, res) => {
    const { policyNumber, description, claimAmount, claimDate } = req.body;
    
    try {
        const emailData = {
            from: 'claim-submission@example.com',
            subject: `New Claim - Policy #${policyNumber}`,
            body: `A new claim has been submitted with the following details:
\n
Policy Number: ${policyNumber} \n
Description: ${description} \n
Claim Amount: £${claimAmount} \n
Claim Date: ${new Date(claimDate).toLocaleDateString()} \n
\n
This is an automated notification.`
        };
        
        const emailResponse = await axios.post(
            `${EMAIL_SERVICE_URL}/api/messages`,
            emailData,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            }
        );
        
        res.status(200).json({ 
            success: true, 
            message: 'Claim submitted successfully',
            claim: { policyNumber, description, claimAmount, claimDate },
            emailResponse: emailResponse.data
        });
    } catch (error) {
        res.status(200).json({ 
            success: true, 
            message: 'Claim submitted successfully, but there was an issue sending the notification.',
            data: { policyNumber, description, claimAmount, claimDate }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Claim submission system is running on http://localhost:${PORT}`);
});
