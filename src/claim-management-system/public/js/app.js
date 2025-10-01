document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const newClaimBtn = document.getElementById('newClaimBtn');
    const newClaimModal = document.getElementById('newClaimModal');
    const closeNewClaimModal = document.getElementById('closeNewClaimModal');
    const newClaimForm = document.getElementById('newClaimForm');
    const cancelNewClaim = document.getElementById('cancelNewClaim');
    
    // Form fields
    const policyNumberInput = document.getElementById('policyNumber');
    const descriptionInput = document.getElementById('description');
    const claimDateInput = document.getElementById('claimDate');
    const claimAmountInput = document.getElementById('claimAmount');

    // Event Listeners
    if (newClaimBtn) newClaimBtn.addEventListener('click', showClaimForm);
    if (closeNewClaimModal) closeNewClaimModal.addEventListener('click', () => newClaimModal.classList.add('hidden'));
    if (cancelNewClaim) cancelNewClaim.addEventListener('click', () => newClaimModal.classList.add('hidden'));
    if (newClaimForm) newClaimForm.addEventListener('submit', handleFormSubmit);
    
    // Close modal when clicking outside
    const detailModal = document.getElementById('claimDetailModal');
    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) {
                detailModal.classList.add('hidden');
            }
        });
    }

    // Show claim form modal
    function showClaimForm() {
        if (newClaimModal) newClaimModal.classList.remove('hidden');
    }

    // Show claim details in the modal
    function showClaimDetails(claim) {
        const detailModal = document.getElementById('claimDetailModal');
        const detailContent = document.getElementById('claimDetailContent');
        
        if (!detailModal || !detailContent) return;
        
        // Format date for display
        const formattedDate = claim.date ? new Date(claim.date).toLocaleDateString() : 'N/A';
        
        detailContent.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="text-md font-medium text-gray-900">Claim Details</h4>
                    <div class="mt-2 bg-gray-50 p-4 rounded-md">
                        <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">Policy Number</dt>
                                <dd class="mt-1 text-sm text-gray-900">${claim.policyNumber || 'N/A'}</dd>
                            </div>
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">Claim Amount</dt>
                                <dd class="mt-1 text-sm text-gray-900">$${claim.amount ? claim.amount.toFixed(2) : '0.00'}</dd>
                            </div>
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">Date of Claim</dt>
                                <dd class="mt-1 text-sm text-gray-900">${formattedDate}</dd>
                            </div>
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">Status</dt>
                                <dd class="mt-1">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                </dd>
                            </div>
                            <div class="sm:col-span-2">
                                <dt class="text-sm font-medium text-gray-500">Description</dt>
                                <dd class="mt-1 text-sm text-gray-900 whitespace-pre-line">${claim.description || 'No description provided'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-700 mb-4">
                    Is this claim within the remaining policy limit?
                </p>
                <div class="flex justify-between space-x-4">
                    <button type="button" id="rejectClaimBtn" class="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm">
                        Reject Claim
                    </button>
                    <button type="button" id="acceptClaimBtn" class="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm">
                        Accept Claim
                    </button>
                </div>
            </div>
            
            <div class="mt-4">
                <button type="button" id="closeDetailModal" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                    Close
                </button>
            </div>
        `;
        
        // Add event listeners to buttons
        const closeButton = detailContent.querySelector('#closeDetailModal');
        const acceptButton = detailContent.querySelector('#acceptClaimBtn');
        const rejectButton = detailContent.querySelector('#rejectClaimBtn');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                detailModal.classList.add('hidden');
            });
        }
        
        if (acceptButton) {
            acceptButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to accept this claim?')) {
                    // Update claim status to accepted
                    updateClaimStatus(claim.id, 'accepted');
                    detailModal.classList.add('hidden');
                }
            });
        }
        
        if (rejectButton) {
            rejectButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reject this claim?')) {
                    // Update claim status to rejected
                    updateClaimStatus(claim.id, 'rejected');
                    detailModal.classList.add('hidden');
                }
            });
        }
        
        // Show the modal
        detailModal.classList.remove('hidden');
        
        // Function to update claim status
        function updateClaimStatus(claimId, status) {
            // In a real app, you would make an API call to update the claim status
            console.log(`Updating claim ${claimId} status to:`, status);
            
            // Update the status in the UI
            const statusElement = document.querySelector(`tr[data-claim-id="${claimId}"] .status-badge`);
            if (statusElement) {
                // Remove all status classes
                statusElement.className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ';
                
                // Add appropriate status class
                if (status === 'accepted') {
                    statusElement.classList.add('bg-green-100', 'text-green-800');
                    statusElement.textContent = 'Approved';
                } else if (status === 'rejected') {
                    statusElement.classList.add('bg-red-100', 'text-red-800');
                    statusElement.textContent = 'Rejected';
                } else {
                    statusElement.classList.add('bg-yellow-100', 'text-yellow-800');
                    statusElement.textContent = 'Pending';
                }
                
                // Show success message
                alert(`Claim ${status} successfully!`);
            }
        }
    }

    // Add a new claim row to the table
    function addClaimToTable(claim) {
        const tbody = document.getElementById('claimsTableBody');
        if (!tbody) return;

        // Remove the loading message if it exists
        const loadingRow = tbody.querySelector('tr td[colspan="6"]');
        if (loadingRow) {
            tbody.innerHTML = '';
        }

        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        // Store the claim data as a data attribute
        row.setAttribute('data-claim-id', claim.id);
        
        // Format date for display
        const formattedDate = claim.date ? new Date(claim.date).toLocaleDateString() : 'N/A';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${claim.policyNumber || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="truncate max-w-xs">${claim.description || 'N/A'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                £${claim.amount ? claim.amount.toFixed(0) : '0'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formattedDate}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="status-badge px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" class="view-claim text-blue-600 hover:text-blue-900" data-claim-id="${claim.id}">View</a>
            </td>
        `;
        
        // Add click handler for the view button
        const viewButton = row.querySelector('.view-claim');
        if (viewButton) {
            viewButton.addEventListener('click', (e) => {
                e.preventDefault();
                showClaimDetails(claim);
            });
        }
        
        tbody.prepend(row);
    }

    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Get form values
        const claimData = {
            id: 'claim-' + Date.now(), // Generate a unique ID
            policyNumber: policyNumberInput ? policyNumberInput.value.trim() : '',
            description: descriptionInput ? descriptionInput.value.trim() : '',
            date: claimDateInput ? claimDateInput.value : '',
            amount: claimAmountInput ? parseFloat(claimAmountInput.value) : 0,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        // Basic validation
        if (!claimData.policyNumber || !claimData.description || !claimData.date || isNaN(claimData.amount) || claimData.amount <= 0) {
            alert('Please fill in all fields with valid values.');
            return;
        }

        // In a real app, you would send this data to your server here
        console.log('Submitting claim:', claimData);
        
        // Add the new claim to the table
        addClaimToTable(claimData);
        
        // Show success message
        alert('Claim submitted successfully!');
        
        // Reset form and close modal
        if (newClaimForm) newClaimForm.reset();
        if (newClaimModal) newClaimModal.classList.add('hidden');
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === newClaimForm) {
            newClaimForm.classList.add('hidden');
        }
    });
});
