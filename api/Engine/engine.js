const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
require('dotenv').config();

const openai_key = process.env.OPENAI_KEY;
const apiUrl = 'https://api.openai.com/v1/chat/completions';

//const promptRules = 'I will give you a hypothetical situation and I would like you to make a hypothetical prediction of what will happen next based on the situation. Return the response ONLY in form of a prediction sentence in 3rd person. Do not repeat any of the previous predictions. Send back as json with `title` and `content` keys. Make `content` a detailed summary of the predicion. Create a relevant `title` given the prediction summary.';

const promptRules = 'I am going to give you some scenarios. I need you to make a hypothetical prediction of what will happen next based on the given scenarios. Return the response ONLY in the form of a predictive sentence in 3rd person. Do not repeat any of the previous predictions. Return as plain text with a word limit of 30. The scenarios will also have weights provided that will affect the predictions. Impact (How positive/negative the outcome is) on a scale of 0-100. 100 being positive, 0 being negative. Polarity (How predictable the outcomes are) Ex: I am having an argument with 3 other people, if there is high polarity, one of the people might start fighting the other. If there is low polarity, The disagreement will continue to playout civilly. The polarity weight is also on a scale of 0-100, 0 being low polarity, 100 being high polarity. Iterations (how many predictions you give) Each prediction should be unique, not entirely different from one another, but are unique outcomes for each prediction. (Max 5 if provided more than 5, just default to giving a max of 5.) Each iteration should use the same Impact and Polarity weight. For example if I give an impact of 5 and a polarity of 80, every iteration should have an impact weight of 5 and a polarity of 80.';

router.post('/generate', async (req, res) => {
    console.log('[engine.js] POST /generate ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    const { prompt, impact, polarity, iterations } = req.body;
    
    if(!prompt || !impact || !polarity || !iterations){
        return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Request:', req.body);
    console.log('Prompt:', prompt);
    console.log('Polarity:', impact);
    console.log('Variability:', polarity);
    console.log('Iterations:', iterations);

    try {
        const timeline = await createPredictionTimeline(prompt, impact, polarity, iterations);
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

const openAiRequestPrediction = async (prompt, impact, polarity) => {
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
                    content: `Positive or Negative scenario outcome. Highly positive impact would be 100, a very negative impact would be 0: ${impact}`
                },
                {
                    role: 'system',
                    content: `Variability/Randomness. 100 would means you should be more wild, extreme, and whimsical in your predictions. 0 means you should be tame, calm, and predictable.: ${polarity}`
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