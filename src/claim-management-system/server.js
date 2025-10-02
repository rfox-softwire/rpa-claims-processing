const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const app = express();

app.use(cors());
const PORT = process.env.PORT || 3003;
const DATA_DIR = path.join(__dirname, 'data');
const CLAIMS_FILE = path.join(DATA_DIR, 'claims.csv');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure the CSV file has the correct headers
const CSV_HEADERS = ['id', 'policyNumber', 'description', 'date', 'amount', 'status', 'submittedAt'];

if (!fs.existsSync(CLAIMS_FILE)) {
    // Create new file with headers
    fs.writeFileSync(CLAIMS_FILE, CSV_HEADERS.join(',') + '\n');
} else {
    // Check if file has headers
    const fileContent = fs.readFileSync(CLAIMS_FILE, 'utf8');
    if (!fileContent.startsWith(CSV_HEADERS.join(','))) {
        // If file exists but doesn't have headers, add them
        const rows = fileContent.split('\n').filter(Boolean);
        rows.unshift(CSV_HEADERS.join(','));
        fs.writeFileSync(CLAIMS_FILE, rows.join('\n') + (fileContent.endsWith('\n') ? '' : '\n'));
    }
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/claims', (req, res) => {
    const results = [];
    
    try {
        const fileContent = fs.readFileSync(CLAIMS_FILE, 'utf8');
        if (fileContent.trim() === '') {
            return res.json([]);
        }
        
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });
        
        const claims = records.map(claim => ({
            ...claim,
            amount: parseFloat(claim.amount) || 0,
            date: claim.date || new Date().toISOString().split('T')[0]
        }));
        
        res.json(claims);
    } catch (error) {
        console.error('Error reading claims:', error);
        res.status(500).json({ error: 'Failed to load claims' });
    }
});

app.post('/api/claims', (req, res) => {
    try {
        const newClaim = {
            id: req.body.id || `claim-${Date.now()}`,
            policyNumber: req.body.policyNumber || '',
            description: req.body.description || '',
            date: req.body.date || new Date().toISOString().split('T')[0],
            amount: parseFloat(req.body.amount) || 0,
            status: req.body.status || 'pending',
            submittedAt: req.body.submittedAt || new Date().toISOString()
        };

        const csvLine = stringify([newClaim], { header: false });
        fs.appendFileSync(CLAIMS_FILE, csvLine);
        
        res.status(201).json(newClaim);
    } catch (error) {
        console.error('Error saving claim:', error);
        res.status(500).json({ error: 'Failed to save claim' });
    }
});

app.put('/api/claims/:id', (req, res) => {
    try {
        const claimId = req.params.id;
        const newStatus = req.body.status;
        
        if (!['pending', 'accepted', 'rejected'].includes(newStatus)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const fileContent = fs.readFileSync(CLAIMS_FILE, 'utf8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });
        
        const claimIndex = records.findIndex(c => c.id === claimId);
        if (claimIndex === -1) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        
        records[claimIndex].status = newStatus;
        
        const csvContent = stringify(records, { header: true });
        fs.writeFileSync(CLAIMS_FILE, csvContent);
        
        res.json({ ...records[claimIndex] });
    } catch (error) {
        console.error('Error updating claim status:', error);
        res.status(500).json({ error: 'Failed to update claim status' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Claim Management System running on http://localhost:${PORT}`);
});
