// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const messageList = document.getElementById('message-list');
    const messageView = document.getElementById('message-view');
    const messageSubject = document.getElementById('message-subject');
    const messageFrom = document.getElementById('message-from');
    const messageDateEl = document.getElementById('message-date');
    const messageBody = document.getElementById('message-body');
    const backToListBtn = document.getElementById('back-to-list');
    const refreshBtn = document.getElementById('refresh-btn');
    const unreadCount = document.getElementById('unread-count');
    
    let lastMessageId = 0;
    let messages = [];
    
    // Event Listeners
    backToListBtn.addEventListener('click', showMessageList);
    refreshBtn.addEventListener('click', loadMessages);

    // Set up event delegation for message list items
    messageList.addEventListener('click', (e) => {
        const messageItem = e.target.closest('.message-item');
        if (messageItem) {
            e.preventDefault();
            const messageId = parseInt(messageItem.getAttribute('data-message-id'));
            viewMessage(messageId);
        }
    });

    // Load messages when the page loads
    loadMessages();
    
    setInterval(loadMessages, 10000);

    // Function to load messages from the server
    async function loadMessages() {
        try {
            console.log('Loading messages...');
            const response = await fetch('/api/messages');
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            console.log('Messages received:', data);
            
            // Always update the messages and render the list
            const previousMessageCount = messages.length;
            messages = data;
            renderMessageList();
            updateUnreadCount();
            
            // Check for new messages and show notifications
            if (data.length > 0) {
                lastMessageId = Math.max(lastMessageId, ...data.map(msg => msg.id));
                
                // Only show notifications for new messages
                if (data.length > previousMessageCount) {
                    const newMessages = data.slice(0, data.length - previousMessageCount);
                    newMessages.forEach(msg => {
                        if (!msg.read) {
                            showNewMessageNotification(msg);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            showError('Failed to load messages');
        }
    }

    // Function to render the message list
    function renderMessageList() {
        console.log('Rendering message list. Total messages:', messages ? messages.length : 0);
        
        if (!messages || messages.length === 0) {
            messageList.innerHTML = `
                <div class="text-center p-5 text-muted">
                    <i class="bi bi-envelope display-4 d-block mb-3"></i>
                    <p>No messages to display</p>
                </div>
            `;
            return;
        }

        let html = '<div class="list-group list-group-flush">';
        
        // Sort messages by date (newest first)
        const sortedMessages = [...messages].sort((a, b) => 
            new Date(b.receivedAt) - new Date(a.receivedAt)
        );
        
        sortedMessages.forEach(message => {
            try {
                const messageDate = new Date(message.receivedAt);
                const formattedDate = messageDate.toLocaleString();
                const isUnread = !message.read;
                const bodyText = typeof message.body === 'string' ? message.body : JSON.stringify(message.body);
                const previewText = bodyText.length > 100 ? bodyText.substring(0, 100) + '...' : bodyText;
                
                html += `
                    <div class="list-group-item list-group-item-action message-item ${isUnread ? 'unread' : ''}" 
                          data-message-id="${message.id}">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${escapeHtml(message.from || 'No sender')}</h6>
                            <small>${formattedDate}</small>
                        </div>
                        <h5 class="mb-1">${escapeHtml(message.subject || 'No subject')}</h5>
                        <p class="mb-1 text-truncate">${escapeHtml(previewText)}</p>
                    </div>
                `;
            } catch (error) {
                console.error('Error rendering message:', error, message);
            }
        });
        
        html += '</div>';
        messageList.innerHTML = html;
        
        // Add event listeners to the new message items
        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const messageId = parseInt(item.getAttribute('data-message-id'));
                viewMessage(messageId);
            });
        });
    }

    // Function to view a specific message
    async function viewMessage(messageId) {
        try {
            // Mark as read
            const response = await fetch(`/api/messages/${messageId}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to mark message as read');
            
            // Refresh messages to update read status
            await loadMessages();
            
            // Find and display the message
            const message = messages.find(m => m.id === messageId);
            if (message) {
                showMessageView(message);
            }
        } catch (error) {
            console.error('Error viewing message:', error);
            showError('Failed to load message');
        }
    }

    // Function to show the message view
    function showMessageView(message) {
        if (!message) {
            console.error('No message provided to showMessageView');
            return;
        }

        try {
            const messageDate = new Date(message.receivedAt);
            const formattedDate = messageDate.toLocaleString();
            
            if (messageSubject) messageSubject.textContent = message.subject || 'No subject';
            if (messageFrom) messageFrom.textContent = `From: ${message.from || 'Unknown sender'}`;
            if (messageDateEl) messageDateEl.textContent = formattedDate;
            if (messageBody) messageBody.innerHTML = (message.body || 'No content').replace(/\n/g, '<br>');
            
            if (messageList) messageList.classList.add('d-none');
            if (messageView) {
                messageView.classList.remove('d-none');
                messageView.classList.add('d-flex');
            }
        } catch (error) {
            console.error('Error in showMessageView:', error);
            throw error; // Re-throw to be caught by the caller
        }
    }

    // Function to show the message list
    function showMessageList() {
        messageList.classList.remove('d-none');
        messageView.classList.add('d-none');
        messageView.classList.remove('d-flex');
    }

    // Function to update the unread message count
    function updateUnreadCount() {
        if (!messages) return;
        const unread = messages.filter(message => !message.read).length;
        unreadCount.textContent = unread;
        document.title = unread > 0 
            ? `(${unread}) Claim Messages - RPA Claims Processing` 
            : 'Claim Messages - RPA Claims Processing';
    }

    // Function to show a new message notification
    function showNewMessageNotification(message) {
        // Simple notification - could be enhanced with a toast library
        const notification = document.createElement('div');
        notification.className = 'alert alert-info alert-dismissible fade show m-3';
        notification.role = 'alert';
        notification.innerHTML = `
            <strong>New Message:</strong> ${message.subject}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to the top of the page
        document.body.prepend(notification);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Function to show error messages
    function showError(message) {
        console.error(message);
        // Simple error display
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger m-3';
        alert.textContent = message;
        
        // Add to the top of the message list
        messageList.prepend(alert);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}); 