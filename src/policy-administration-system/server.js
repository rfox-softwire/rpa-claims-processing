const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3002;
const POLICIES_FILE = path.join(__dirname, 'policies.csv');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

let policiesCache = new Map();

async function loadPolicies() {
    try {
        const data = await fs.readFile(POLICIES_FILE, 'utf8');
        const lines = data.trim().split('\n').slice(1);
        
        policiesCache.clear();
        
        lines.forEach(line => {
            const [policyId, totalLimit, claimedAmount] = line.split(',');
            policiesCache.set(policyId, {
                totalLimit: parseInt(totalLimit, 10),
                claimedAmount: parseInt(claimedAmount, 10),
                remainingLimit: parseInt(totalLimit, 10) - parseInt(claimedAmount, 10)
            });
        });
    } catch (err) {
        process.exit(1);
    }
}

app.get('/api/policy/:policyId', (req, res) => {
    const policyId = req.params.policyId.toUpperCase();
    const policy = policiesCache.get(policyId);
    
    if (!policy) {
        return res.status(404).json({ 
            success: false, 
            message: 'Policy not found' 
        });
    }
    
    res.json({
        success: true,
        data: {
            policyId,
            totalPolicyLimit: policy.totalLimit,
            totalClaimedAmount: policy.claimedAmount,
            remainingPolicyLimit: policy.remainingLimit
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function startServer() {
    await loadPolicies();
    
    app.listen(PORT, () => {
        console.log(`Policy Administration System running on http://localhost:${PORT}`);
    });
}

startServer();
