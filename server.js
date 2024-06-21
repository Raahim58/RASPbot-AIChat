const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI({ apiKey: process.env.GOOGLE_GEN_AI_KEY });

// API endpoint for handling gemini chat
app.post('/gemini', async (req, res) => {
    try {
        console.log(req.body.history);
        console.log(req.body.message);

        const model = await genAI.model('models/gemini-pro');
        const chat = await model.chat({
            history: req.body.history,
            prompt: req.body.message,
        });

        res.send(chat.data.text);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, 'build')));

// All remaining requests return the React app, so it can handle routing.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
