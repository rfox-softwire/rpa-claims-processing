const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files with proper MIME types
app.use((req, res, next) => {
    if (req.url.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
    }
    next();
});

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error loading the form');
        }
    });
});

// Handle form submission
app.post('/submit-claim', async (req, res) => {
    const { policyNumber, description, claimAmount, claimDate } = req.body;
    
    // Basic validation
    if (!policyNumber || !description || !claimAmount || !claimDate) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    console.log('New claim submitted:', { policyNumber, description, claimAmount, claimDate });
    
    try {
        // Forward the claim to the email simulation system
        const emailResponse = await axios.post(`${EMAIL_SERVICE_URL}/api/emails`, {
            from: `claim-submission@example.com`,
            subject: `New Claim Submitted - Policy #${policyNumber}`,
            body: `A new claim has been submitted with the following details:
                
Policy Number: ${policyNumber}
Description: ${description}
Claim Amount: $${claimAmount}
Claim Date: ${new Date(claimDate).toLocaleDateString()}

This is an automated notification.`
        });
        
        console.log('Claim forwarded to email system:', emailResponse.data);
        
        res.json({ 
            success: true, 
            message: 'Claim submitted successfully and notification sent!',
            data: { policyNumber, description, claimAmount, claimDate }
        });
    } catch (error) {
        console.error('Error forwarding claim to email system:', error.message);
        
        // Still respond with success to the user even if email forwarding fails
        res.json({ 
            success: true, 
            message: 'Claim submitted successfully, but there was an issue sending the notification.',
            data: { policyNumber, description, claimAmount, claimDate }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
