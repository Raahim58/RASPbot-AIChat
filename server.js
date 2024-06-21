const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_KEY);

// API endpoint for handling gemini chat
app.post('/gemini', async (req, res) => {
    console.log(req.body.history);
    console.log(req.body.message);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const chat = model.startChat({
        history: req.body.history
    });

    const msg = req.body.message;
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    res.send(text);
});

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, 'project 2 gemini chatbot/src/build')));

// All remaining requests return the React app, so it can handle routing.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'project 2 gemini chatbot/src/build/index.html'));
});

app.listen(8000, () => {
    console.log(`Server is running on port 8000`);
});
