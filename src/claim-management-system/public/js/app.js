// Status enum and mapping
const ClaimStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
};

const StatusConfig = {
    [ClaimStatus.PENDING]: {
        text: 'Pending',
        class: 'bg-yellow-100 text-yellow-800'
    },
    [ClaimStatus.ACCEPTED]: {
        text: 'Approved',
        class: 'bg-green-100 text-green-800'
    },
    [ClaimStatus.REJECTED]: {
        text: 'Rejected',
        class: 'bg-red-100 text-red-800'
    }
};

const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', function() {
    loadClaims();
    
    async function loadClaims() {
        try {
            const response = await fetch(`${API_BASE_URL}/claims`);
            if (!response.ok) throw new Error('Failed to load claims');
            const claims = await response.json();
            
            const tbody = document.getElementById('claimsTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                
                if (claims.length === 0) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                            No claims found. Add your first claim to get started.
                        </td>
                    `;
                    tbody.appendChild(tr);
                    return;
                }
                
                claims.forEach(claim => addClaimToTable(claim));
            }
        } catch (error) {
            console.error('Error loading claims:', error);
            alert('Failed to load claims. Please try again later.');
        }
    }
    const newClaimBtn = document.getElementById('newClaimBtn');
    const newClaimModal = document.getElementById('newClaimModal');
    const detailModal = document.getElementById('claimDetailModal');
    const closeNewClaimModal = document.getElementById('closeNewClaimModal');
    const newClaimForm = document.getElementById('newClaimForm');
    const cancelNewClaim = document.getElementById('cancelNewClaim');
    const detailContent = document.getElementById('claimDetailContent');
    const policyNumberInput = document.getElementById('policyNumber');
    const descriptionInput = document.getElementById('description');
    const claimDateInput = document.getElementById('claimDate');
    const claimAmountInput = document.getElementById('claimAmount');

    newClaimBtn.addEventListener('click', showClaimForm);
    closeNewClaimModal.addEventListener('click', () => newClaimModal.classList.add('hidden'));
    cancelNewClaim.addEventListener('click', () => newClaimModal.classList.add('hidden'));
    newClaimForm.addEventListener('submit', handleFormSubmit);

    window.addEventListener('click', (e) => {
        if (detailModal && e.target === detailModal) {
            detailModal.classList.add('hidden');
        }
        if (newClaimModal && e.target === newClaimModal) {
            newClaimModal.classList.add('hidden');
        }
    });

    function showClaimForm() {
        if (newClaimModal) newClaimModal.classList.remove('hidden');
    }

    function showClaimDetails(claim) {
        if (!detailModal || !detailContent) return;
        
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
                                <dd class="mt-1 text-sm text-gray-900">£${claim.amount ? claim.amount.toFixed(0) : '0'}</dd>
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
        
        const closeButton = detailContent.querySelector('#closeDetailModal');
        const acceptButton = detailContent.querySelector('#acceptClaimBtn');
        const rejectButton = detailContent.querySelector('#rejectClaimBtn');
        
        closeButton.addEventListener('click', () => {
            detailModal.classList.add('hidden');
        });
        
        acceptButton.addEventListener('click', () => {
            updateClaimStatus(claim.id, 'accepted');
            detailModal.classList.add('hidden');
        });
        
        rejectButton.addEventListener('click', () => {
            updateClaimStatus(claim.id, 'rejected');
            detailModal.classList.add('hidden');
        });
        
        detailModal.classList.remove('hidden');
        
        async function updateClaimStatus(claimId, status) {            
            try {
                const response = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status })
                });
                
                if (!response.ok) throw new Error('Failed to update claim status');
                
                const statusElement = document.querySelector(`tr[data-claim-id="${claimId}"] .status-badge`);
                if (statusElement) {
                    statusElement.className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ';
                    const statusInfo = StatusConfig[status] || StatusConfig[ClaimStatus.PENDING];
                    statusElement.textContent = statusInfo.text;
                    statusElement.className = `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`;
                }
            } catch (error) {
                console.error('Error updating claim status:', error);
                alert('Failed to update claim status. Please try again.');
            }
        }
    }

    function addClaimToTable(claim) {
        const tbody = document.getElementById('claimsTableBody');
        if (!tbody) return;

        const existingRows = tbody.querySelectorAll('tr');
        if (existingRows.length === 1 && existingRows[0].querySelector('td[colspan]')) {
            tbody.innerHTML = '';
        }

        const existingRow = tbody.querySelector(`tr[data-claim-id="${claim.id}"]`);
        if (existingRow) {
            existingRow.innerHTML = getClaimRowHTML(claim);
            return;
        }
        
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.setAttribute('data-claim-id', claim.id);
        row.innerHTML = getClaimRowHTML(claim);
        
        const viewButton = row.querySelector('.view-claim');
        if (viewButton) {
            viewButton.addEventListener('click', (e) => {
                e.preventDefault();
                showClaimDetails(claim);
            });
        }

        tbody.prepend(row);
        
        function getClaimRowHTML(claim) {
            const formattedDate = claim.date ? new Date(claim.date).toLocaleDateString() : 'N/A';
            const statusInfo = StatusConfig[claim.status] || StatusConfig[ClaimStatus.PENDING];
            const statusText = statusInfo.text;
            const statusClass = statusInfo.class;
            
            return `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${claim.policyNumber || 'N/A'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="truncate max-w-xs">${claim.description || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    £${claim.amount ? parseFloat(claim.amount).toFixed(0) : '0'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${formattedDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" class="view-claim text-blue-600 hover:text-blue-900" data-claim-id="${claim.id}">View</a>
                </td>
            `;
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        const claimData = {
            policyNumber: policyNumberInput ? policyNumberInput.value.trim() : '',
            description: descriptionInput ? descriptionInput.value.trim() : '',
            date: claimDateInput ? claimDateInput.value : '',
            amount: claimAmountInput ? parseFloat(claimAmountInput.value) : 0,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        if (!claimData.policyNumber || !claimData.description || !claimData.date || isNaN(claimData.amount) || claimData.amount <= 0) {
            alert('Please fill in all fields with valid values.');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(claimData)
            });
            
            if (!response.ok) throw new Error('Failed to save claim');
            
            const savedClaim = await response.json();
            addClaimToTable(savedClaim);
            newClaimForm.reset();
            newClaimModal.classList.add('hidden');
            
            const tbody = document.getElementById('claimsTableBody');
            if (tbody && tbody.querySelector('td[colspan]')) {
                loadClaims();
            }
        } catch (error) {
            console.error('Error saving claim:', error);
            alert('Failed to save claim. Please try again.');
        }
    }
});
