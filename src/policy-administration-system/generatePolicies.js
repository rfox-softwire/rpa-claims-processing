const fs = require('fs');
const path = require('path');

// Configuration
const NUM_POLICIES = 100;
const MIN_POLICY_LIMIT = 1000;  // $1,000
const MAX_POLICY_LIMIT = 100000; // $100,000
const OUTPUT_FILE = path.join(__dirname, 'policies.csv');

// Helper function to generate a random number between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random policy ID in the format 'POL-XXXXXX' where X is a digit
function generatePolicyId() {
    return 'POL-' + Math.floor(100000 + Math.random() * 900000);
}

// Round a number to the nearest thousand
function roundToNearestThousand(num) {
    return Math.round(num / 1000) * 1000;
}

// Generate the CSV content
function generatePoliciesCsv() {
    const policies = [];
    const usedPolicyIds = new Set();
    
    // Generate header
    const headers = ['policy_id', 'total_policy_limit', 'total_claimed_amount'];
    policies.push(headers.join(','));
    
    // Generate policy data
    for (let i = 0; i < NUM_POLICIES; i++) {
        // Generate unique policy ID
        let policyId;
        do {
            policyId = generatePolicyId();
        } while (usedPolicyIds.has(policyId));
        usedPolicyIds.add(policyId);
        
        // Generate policy limit (rounded to nearest thousand)
        const policyLimit = roundToNearestThousand(
            getRandomInt(MIN_POLICY_LIMIT, MAX_POLICY_LIMIT)
        );
        
        // Generate claimed amount (up to 90% of policy limit to ensure it's always less than or equal to the limit)
        const maxClaimedAmount = Math.floor(policyLimit * 0.9);
        const claimedAmount = getRandomInt(0, maxClaimedAmount);
        
        // Add to policies array
        policies.push([policyId, policyLimit, claimedAmount].join(','));
    }
    
    return policies.join('\n');
}

// Write the CSV file
function writePoliciesToFile() {
    const csvContent = generatePoliciesCsv();
    
    fs.writeFile(OUTPUT_FILE, csvContent, (err) => {
        if (err) {
            console.error('Error writing policies to file:', err);
            return;
        }
        console.log(`Successfully generated ${NUM_POLICIES} policies in ${OUTPUT_FILE}`);
    });
}

// Run the script
writePoliciesToFile();
