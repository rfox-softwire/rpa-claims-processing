const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// In-memory storage for messages
let messages = [];

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Serve the client interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add a test route to verify static file serving
app.get('/test-js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'js', 'app.js'));
});

// API endpoint to receive new messages from claim system
app.post('/api/messages', (req, res) => {
    console.log('=== NEW REQUEST ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Raw body:', req.body);
    console.log('Parsed body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { from = 'claim-system@example.com', subject = 'New Claim Notification', body } = req.body;
        
        console.log('Extracted values:', { from, subject, body });
        
        if (!body) {
            console.error('Error: Message body is required');
            return res.status(400).json({ 
                success: false,
                error: 'Message body is required',
                receivedBody: req.body
            });
        }

        const newMessage = {
            id: Date.now(),
            from,
            subject,
            body: typeof body === 'string' ? body : JSON.stringify(body, null, 2),
            receivedAt: new Date().toISOString(),
            read: false
        };

        console.log('New message created:', JSON.stringify(newMessage, null, 2));
        messages.unshift(newMessage);
        
        console.log(`Total messages in memory: ${messages.length}`);
        
        res.status(201).json({
            success: true,
            message: 'Message received successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// API endpoint to get all messages
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

// API endpoint to mark message as read
app.patch('/api/messages/:id/read', (req, res) => {
    const message = messages.find(m => m.id === parseInt(req.params.id));
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    
    message.read = true;
    res.json(message);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Email system running on http://localhost:${PORT}`);
});
