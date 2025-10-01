const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.EMAIL_PORT || 3001;

// In-memory storage for emails (in a real app, use a database)
let emails = [];

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the email client interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to receive new claims (simulating email reception)
app.post('/api/emails', (req, res) => {
    const { from, subject, body } = req.body;
    
    if (!from || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newEmail = {
        id: Date.now(),
        from,
        subject,
        body,
        receivedAt: new Date().toISOString(),
        read: false
    };

    emails.unshift(newEmail); // Add to beginning of array (newest first)
    
    console.log('New email received:', newEmail);
    res.status(201).json(newEmail);
});

// API endpoint to get all emails
app.get('/api/emails', (req, res) => {
    res.json(emails);
});

// API endpoint to mark email as read
app.patch('/api/emails/:id/read', (req, res) => {
    const email = emails.find(e => e.id === parseInt(req.params.id));
    if (!email) {
        return res.status(404).json({ error: 'Email not found' });
    }
    
    email.read = true;
    res.json(email);
});

// API endpoint to delete an email
app.delete('/api/emails/:id', (req, res) => {
    const index = emails.findIndex(e => e.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Email not found' });
    }
    
    emails.splice(index, 1);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Email simulation server running on http://localhost:${PORT}`);
});
