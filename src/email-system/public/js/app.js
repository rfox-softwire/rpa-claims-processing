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
    const messageList = document.getElementById('message-list');
    const messageView = document.getElementById('message-view');
    const messageSubject = document.getElementById('message-subject');
    const messageFrom = document.getElementById('message-from');
    const messageDateEl = document.getElementById('message-date');
    const messageBody = document.getElementById('message-body');
    const backToListBtn = document.getElementById('back-to-list');
    const refreshBtn = document.getElementById('refresh-btn');
    const unreadCount = document.getElementById('unread-count');

    let messages = [];
    
    backToListBtn.addEventListener('click', showMessageList);
    refreshBtn.addEventListener('click', loadMessages);

    messageList.addEventListener('click', (e) => {
        const messageItem = e.target.closest('.message-item');
        if (messageItem) {
            e.preventDefault();
            const messageId = parseInt(messageItem.getAttribute('data-message-id'));
            viewMessage(messageId);
        }
    });

    loadMessages();

    async function loadMessages() {
        try {
            const response = await fetch('/api/messages');
            if (!response.ok) throw new Error('Failed to fetch messages');
            messages = await response.json();
            renderMessageList();
            updateUnreadCount();
        } catch (error) {
            showError('Failed to load messages');
        }
    }

    function renderMessageList() {       
        if (!messages || messages.length === 0) {
            messageList.innerHTML = `
                <div class="text-center p-8">
                    <p class="text-gray-600">No messages to display</p>
                </div>
            `;
            return;
        }
        
        let html = '<div>';
        
        const sortedMessages = [...messages].sort((a, b) => 
            new Date(b.receivedAt) - new Date(a.receivedAt)
        );
        
        sortedMessages.forEach(message => {
            try {
                if (!message || typeof message !== 'object') {
                    console.warn('Invalid message format:', message);
                    return;
                }

                const messageDate = message.receivedAt ? new Date(message.receivedAt) : new Date();
                const formattedDate = messageDate.toLocaleString();
                const isUnread = message.read === false; // Explicitly check for false
                
                let bodyText = '';
                if (message.body) {
                    bodyText = typeof message.body === 'string' 
                        ? message.body 
                        : JSON.stringify(message.body);
                }
                
                const previewText = bodyText && bodyText.length > 100 
                    ? bodyText.substring(0, 100) + '...' 
                    : bodyText || 'No content';
                
                html += `
                    <div class="message-item p-4 hover:bg-gray-50 cursor-pointer ${isUnread ? 'bg-blue-50' : 'bg-white'}" 
                          data-message-id="${message.id}">
                        <div class="flex justify-between w-full">
                            <h6 class="text-sm font-medium text-gray-900 mb-1">${escapeHtml(message.from || 'No sender')}</h6>
                            <span class="text-xs text-gray-500">${formattedDate}</span>
                        </div>
                        <h5 class="text-base font-semibold text-gray-900 mb-1">${escapeHtml(message.subject || 'No subject')}</h5>
                        <p class="text-sm text-gray-600 truncate">${escapeHtml(previewText)}</p>
                    </div>
                `;
            } catch (error) {
                console.error('Error rendering message:', error, message);
            }
        });
        
        html += '</div>';
        messageList.innerHTML = html;
        
        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const messageId = parseInt(item.getAttribute('data-message-id'));
                if (!isNaN(messageId)) {
                    viewMessage(messageId);
                }
            });
        });
    }

    async function viewMessage(messageId) {
        try {
            const messageToView = messages.find(m => m.id === messageId);
            if (!messageToView) {
                throw new Error('Message not found');
            }
    
            showMessageView(messageToView);
    
            const response = await fetch(`/api/messages/${messageId}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to mark message as read');
            }
            
            await loadMessages();
            
        } catch (error) {
            console.error('Error viewing message:', error);
            showError('Failed to load message');
        }
    }

    function showMessageView(message) {
        if (!message) {
            console.error('No message provided to showMessageView');
            return;
        }

        try {
            const messageDate = message.receivedAt ? new Date(message.receivedAt) : new Date();
            const formattedDate = messageDate.toLocaleString();
            
            if (messageSubject) messageSubject.textContent = message.subject || 'No subject';
            if (messageFrom) messageFrom.textContent = `From: ${message.from || 'Unknown sender'}`;
            if (messageDateEl) messageDateEl.textContent = formattedDate;
            
            
            let bodyContent = 'No content';
            if (message.body) {
                if (typeof message.body === 'string') {
                    try {
                        const parsedBody = JSON.parse(message.body);
                        bodyContent = typeof parsedBody === 'object' 
                            ? `<pre>${JSON.stringify(parsedBody, null, 2)}</pre>`
                            : parsedBody;
                    } catch (e) {
                        bodyContent = message.body;
                    }
                } else if (typeof message.body === 'object') {
                    bodyContent = `<pre>${JSON.stringify(message.body, null, 2)}</pre>`;
                }
                
                if (typeof bodyContent === 'string' && !bodyContent.startsWith('<pre>')) {
                    bodyContent = bodyContent.replace(/\n/g, '<br>');
                }
            }
            
            if (messageBody) {
                messageBody.innerHTML = bodyContent;
            }
            
            if (messageList) messageList.classList.add('hidden');
            if (messageView) {
                messageView.classList.remove('hidden');
                messageView.classList.add('flex');
            }
        } catch (error) {
            console.error('Error displaying message:', error);
            if (messageBody) {
                messageBody.innerHTML = 'Error displaying message content.';
            }
        }
    }

    function showMessageList() {
        if (messageList) messageList.classList.remove('hidden');
        if (messageView) {
            messageView.classList.add('hidden');
            messageView.classList.remove('flex');
        }
    }

    function updateUnreadCount() {
        if (!messages) return;
        const unread = messages.filter(message => !message.read).length;
        unreadCount.textContent = unread;
        document.title = unread > 0 
            ? `(${unread}) Claim Messages - RPA Claims Processing` 
            : 'Claim Messages - RPA Claims Processing';
    }

    function showError(message) {
        console.error(message);
        const alert = document.createElement('div');
        alert.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-3';
        alert.textContent = message;
        
        messageList.prepend(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}); 