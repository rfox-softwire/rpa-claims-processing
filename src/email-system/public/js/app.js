document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const composeBtn = document.getElementById('composeBtn');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const emailPanel = document.getElementById('emailPanel');
    const emailView = document.getElementById('emailView');
    const composeForm = document.getElementById('composeForm');
    const emailItems = document.querySelectorAll('.email-item');
    const emailPanelTitle = document.getElementById('emailPanelTitle');
    
    // Sample email data
    const sampleEmails = [
        {
            id: 1,
            from: 'Claims Team <claims@example.com>',
            to: 'me@example.com',
            subject: 'New Claim Submission #12345',
            date: 'Today, 10:30 AM',
            body: `Hello Team,\n\nA new claim has been submitted with the following details:\n\n- Claim ID: #12345\n- Policy Number: POL-123456\n- Claimant: John Doe\n- Claim Amount: £2,500.00\n- Date of Incident: 2023-10-01\n\nPlease review the attached documents and process the claim accordingly.\n\nBest regards,\nClaims System`,
            attachments: [
                { name: 'claim_form.pdf', size: '245 KB', type: 'pdf' },
                { name: 'receipt.jpg', size: '1.2 MB', type: 'image' }
            ],
            read: false,
            important: true
        }
        // Add more sample emails as needed
    ];

    // Event Listeners
    composeBtn.addEventListener('click', showComposeForm);
    closePanelBtn.addEventListener('click', hidePanel);

    // Add click event to email items
    emailItems.forEach(item => {
        item.addEventListener('click', function() {
            const emailId = parseInt(this.dataset.emailId);
            const email = sampleEmails.find(e => e.id === emailId) || sampleEmails[0];
            showEmail(email);
        });
    });

    // Show compose form
    function showComposeForm() {
        emailPanelTitle.textContent = 'New Message';
        emailView.classList.add('hidden');
        composeForm.classList.remove('hidden');
        emailPanel.classList.remove('hidden');
    }

    // Show email content
    function showEmail(email) {
        // Update email view with email data
        document.getElementById('emailFrom').textContent = `From: ${email.from}`;
        document.getElementById('emailSubject').textContent = email.subject;
        document.getElementById('emailDate').textContent = email.date;
        document.getElementById('emailBody').innerHTML = email.body.replace(/\n/g, '<br>');
        
        // Update attachments
        const attachmentsContainer = document.querySelector('#emailView .mt-6.pt-6.border-t');
        if (attachmentsContainer) {
            const attachmentsList = attachmentsContainer.querySelector('.flex.space-x-4');
            if (attachmentsList) {
                attachmentsList.innerHTML = email.attachments.map(attachment => `
                    <div class="flex items-center p-3 border border-gray-200 rounded-md">
                        <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${getAttachmentIcon(attachment.type)}
                        </svg>
                        <div class="ml-3">
                            <p class="text-sm font-medium text-gray-900">${attachment.name}</p>
                            <p class="text-xs text-gray-500">${attachment.size}</p>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Update UI
        emailPanelTitle.textContent = email.subject;
        emailView.classList.remove('hidden');
        composeForm.classList.add('hidden');
        emailPanel.classList.remove('hidden');
        
        // Mark as read
        email.read = true;
        updateEmailItemUI(email.id);
    }

    // Get appropriate icon for attachment type
    function getAttachmentIcon(type) {
        switch(type) {
            case 'pdf':
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>';
            case 'image':
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>';
            default:
                return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>';
        }
    }

    // Update email item UI (read/unread, important, etc.)
    function updateEmailItemUI(emailId) {
        const emailItem = document.querySelector(`[data-email-id="${emailId}"]`);
        if (!emailItem) return;
        
        const email = sampleEmails.find(e => e.id === emailId);
        if (!email) return;
        
        // Update read status
        if (email.read) {
            emailItem.classList.remove('font-semibold');
            emailItem.classList.add('font-normal');
        } else {
            emailItem.classList.remove('font-normal');
            emailItem.classList.add('font-semibold');
        }
        
        // Update important status
        if (email.important) {
            emailItem.classList.add('border-l-4', 'border-yellow-400');
        } else {
            emailItem.classList.remove('border-l-4', 'border-yellow-400');
        }
    }

    // Hide the email panel
    function hidePanel() {
        emailPanel.classList.add('hidden');
    }

    // Initialize the UI with the first email
    if (sampleEmails.length > 0) {
        showEmail(sampleEmails[0]);
    }

    // Simulate new email notification
    setTimeout(() => {
        const newEmailNotification = document.createElement('div');
        newEmailNotification.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center new-email';
        newEmailNotification.innerHTML = `
            <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            New email received
        `;
        document.body.appendChild(newEmailNotification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            newEmailNotification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
            setTimeout(() => {
                newEmailNotification.remove();
            }, 500);
        }, 5000);
    }, 3000);
});
