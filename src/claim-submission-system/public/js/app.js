document.addEventListener('DOMContentLoaded', () => {
    const claimForm = document.getElementById('claimForm');
    if (!claimForm) return;

    claimForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            policyNumber: document.getElementById('policyNumber').value,
            description: document.getElementById('description').value,
            claimAmount: parseFloat(document.getElementById('claimAmount').value),
            claimDate: document.getElementById('claimDate').value
        };
        
        const responseMessage = document.getElementById('responseMessage');
        
        try {
            const response = await fetch('/submit-claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                responseMessage.textContent = 'Claim submitted successfully!';
                responseMessage.className = 'mt-6 p-4 rounded-md text-center bg-green-100 text-green-700 border border-green-200';
                responseMessage.classList.remove('hidden');
                claimForm.reset();
            } else {
                throw new Error(data.error || 'Failed to submit claim');
            }
        } catch (error) {
            responseMessage.textContent = `Error: ${error.message}`;
            responseMessage.className = 'mt-6 p-4 rounded-md text-center bg-red-100 text-red-700 border border-red-200';
            responseMessage.classList.remove('hidden');
        }

        setTimeout(() => {
            responseMessage.textContent = '';
            responseMessage.className = 'hidden';
        }, 5000);
    });
});
