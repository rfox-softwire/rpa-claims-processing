document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('policyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const policyId = document.getElementById('policyId').value.trim().toUpperCase();
        const policyInfo = document.getElementById('policyInfo');
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('errorMessage');
        
        policyInfo.classList.remove('visible');
        errorMessage.classList.add('hidden');
        loading.classList.add('visible');
        
        try {
            const response = await fetch(`/api/policy/${encodeURIComponent(policyId)}`);
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('policyIdDisplay').textContent = data.data.policyId;
                document.getElementById('totalLimit').textContent = formatCurrency(data.data.totalPolicyLimit);
                document.getElementById('claimedAmount').textContent = formatCurrency(data.data.totalClaimedAmount);
                document.getElementById('remainingLimit').textContent = formatCurrency(data.data.remainingPolicyLimit);
                policyInfo.classList.add('visible');
            } else {
                showError(data.message || 'Policy not found');
            }
        } catch (error) {
            showError('An error occurred while fetching policy information');
        } finally {
            loading.classList.remove('visible');
        }
    });
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}
