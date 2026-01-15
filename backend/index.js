const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/video', require('./routes/video'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/review', require('./routes/review'));

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Force process to stay alive
process.stdin.resume();

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
    } else {
        console.error('SERVER ERROR:', err);
    }
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});
