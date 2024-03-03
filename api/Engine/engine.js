const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
require('dotenv').config();

const openai_key = process.env.OPENAI_KEY;
const apiUrl = 'https://api.openai.com/v1/chat/completions';

const promptRules = 'I will give you a hypothetical situation and I would like you to make a hypothetical prediction of what will happen next based on the situation. Return the response ONLY in form of a prediction sentence in 3rd person. Do not repeat any of the previous predictions. Send back as json with `title` and `content` keys. Make `content` a detailed summary of the predicion. Create a relevant `title` given the prediction summary.';

router.post('/generate', async (req, res) => {
    console.log('[engine.js] POST /generate ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    const { prompt, polarity, variability, iterations } = req.body;
    
    if(!prompt || !polarity || !variability || !iterations){
        return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Request:', req.body);
    console.log('Prompt:', prompt);
    console.log('Polarity:', polarity);
    console.log('Variability:', variability);
    console.log('Iterations:', iterations);

    try {
        const timeline = await createPredictionTimeline(prompt, polarity, variability, iterations);
        console.log('Timeline:', timeline);
        res.status(200).json(timeline);
    }
    catch (error) {
        console.error('Error creating prediction timeline:', error.message);
        res.status(500).json({ error: 'An error occurred' });
    }
});

const createPredictionTimeline = async (prompt, polarity, variability, iterations) => {
    try{
        let predictions = [prompt];

        let prediction;

        for(let i = 0; i < iterations; i++){
            prediction = await openAiRequestPrediction(predictions.join(' '), polarity, variability);
            predictions.push(prediction);
            console.log('Prediction:', prediction);
        }

        return predictions;

    } catch (error) {
        console.error('Error creating prediction timeline:', error.message);
        throw new Error('Failed to create prediction timeline');
    }
}

const openAiRequestPrediction = async (prompt, polarity, variability) => {
    try {
        const requestData = {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: promptRules
                },
                {
                    role: 'system',
                    content: `Positive / Negative outcome (+/- 100) : ${polarity}`
                },
                {
                    role: 'system',
                    content: `Randomness (0-100): ${variability}`
                },
                {
                    role: 'system',
                    content: prompt
                }
            ]
        };

        //console.log('requestData:', requestData);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openai_key}`,
        };

        const response = await axios.post(apiUrl, requestData, { headers });

        const chatResponse = response.data.choices[0].message.content;

        return chatResponse;
    } catch (error) {
        console.error('Error during API request:', error.message);
        throw new Error('Failed to fetch chat response from OpenAI API');
    }
};

module.exports = router;