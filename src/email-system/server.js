const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

let messages = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.options('*', cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/api/messages', (req, res) => { 
    try {
        const { from = 'claim-system@example.com', subject = 'New Claim Notification', body } = req.body;
        
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

        messages.unshift(newMessage);
        
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

app.get('/api/messages', (req, res) => {
    res.json(messages);
});

app.patch('/api/messages/:id/read', (req, res) => {
    const message = messages.find(m => m.id === parseInt(req.params.id));
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    
    message.read = true;
    res.json(message);
});

app.listen(PORT, () => {
    console.log(`Email system running on http://localhost:${PORT}`);
});
