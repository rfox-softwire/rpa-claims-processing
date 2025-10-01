const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for claims (in a real app, use a database)
let claims = [];

// API endpoint to get all claims
app.get('/api/claims', (req, res) => {
    res.json(claims);
});

// API endpoint to get a single claim
app.get('/api/claims/:id', (req, res) => {
    const claim = claims.find(c => c.id === req.params.id);
    if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
    }
    res.json(claim);
});

// API endpoint to update claim status
app.patch('/api/claims/:id/status', async (req, res) => {
    const { status } = req.body;
    const claimIndex = claims.findIndex(c => c.id === req.params.id);
    
    if (claimIndex === -1) {
        return res.status(404).json({ error: 'Claim not found' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    claims[claimIndex].status = status;
    claims[claimIndex].updatedAt = new Date().toISOString();
    
    res.json(claims[claimIndex]);
});

// API endpoint to add notes to a claim
app.post('/api/claims/:id/notes', (req, res) => {
    const { note } = req.body;
    const claimIndex = claims.findIndex(c => c.id === req.params.id);
    
    if (claimIndex === -1) {
        return res.status(404).json({ error: 'Claim not found' });
    }
    
    if (!note || typeof note !== 'string' || note.trim() === '') {
        return res.status(400).json({ error: 'Note is required' });
    }
    
    if (!claims[claimIndex].notes) {
        claims[claimIndex].notes = [];
    }
    
    const newNote = {
        id: Date.now().toString(),
        text: note.trim(),
        createdAt: new Date().toISOString(),
        createdBy: 'admin' // In a real app, this would be the logged-in user
    };
    
    claims[claimIndex].notes.unshift(newNote);
    res.status(201).json(newNote);
});

// Webhook to receive new claims from the submission system
app.post('/api/webhook/claims', async (req, res) => {
    const { policyNumber, description, claimAmount, claimDate } = req.body;
    
    // Basic validation
    if (!policyNumber || !description || claimAmount === undefined || !claimDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const newClaim = {
            id: `CLM-${Date.now()}`,
            policyNumber,
            description,
            claimAmount: parseFloat(claimAmount),
            claimDate: new Date(claimDate).toISOString(),
            status: 'pending',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: []
        };
        
        claims.unshift(newClaim);
        console.log(`New claim received: ${newClaim.id} for policy ${policyNumber}`);
        
        res.status(201).json(newClaim);
    } catch (error) {
        console.error('Error processing new claim:', error);
        res.status(500).json({ error: 'Failed to process claim' });
    }
});

// Serve the management interface
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Claim Management System running on http://localhost:${PORT}`);
});
