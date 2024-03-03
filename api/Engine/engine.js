const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
require('dotenv').config();

const openai_key = process.env.OPENAI_KEY;
const apiUrl = 'https://api.openai.com/v1/chat/completions';
const defaultUser = 'admin';

// Define a test prompt for debugging purposes
const testPrompt = 'Tell me a joke.';
const promptRules = 'I will give you a hypothetical situation and I would like you to make a hypothetical prediction of what will happen next based on the situation. Return the response ONLY in form of a prediction sentence in 3rd person. Do not repeat any of the previous predictions. Send back as json with `title` and `content` keys. Make `content` a detailed summary of the predicion. Create a relevant `title` given the prediction summary.';

// Define a route handler for POST requests
router.post('/', async (req, res) => {
    console.log('[engine.js] POST / ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    try {
        // Call the function to make the API request
        const response = await openAiRequestTest(testPrompt);

        // Send the response back to the client
        res.json({ response });
    } catch (error) {
        // If an error occurs, send a 500 status with an error message
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Create new root prompt
// Store prompt in roots table
router.post('/createRoot', async (req, res) => {
    console.log('[engine.js] POST /createRoot ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const { prompt, title } = req.query;
    console.log('params:', req.query);

    if (!prompt || !title) {
        return res.status(400).json({ error: 'Prompt and title are required' }); // Return early with error response
    }

    try {
        await insertNewRoot(title, prompt);

        // Add header to response
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send('Root prompt created successfully');

        // res.send('Root prompt created successfully');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get('/getRandomRoot', async (req, res) => {
    console.log('[engine.js] GET /getRandomRoot ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    try {
        // Make sure that root_look is 0
        const [rows] = await db.query('SELECT * FROM roots WHERE root_lock = 0 ORDER BY RAND() LIMIT 1');
        console.log('rows:', rows);
        const root = rows;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json({ root });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/lockRoot', async (req, res) => {
    console.log('[engine.js] POST /lockRoot ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    const { root_id } = req.query;

    try {
        await db.query('UPDATE roots SET root_lock = 1 WHERE root_id = ?', [root_id]);
        res.send('Root prompt locked successfully');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/unlockRoot', async (req, res) => {
    console.log('[engine.js] POST /unlockRoot ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    const { root_id } = req.query;

    try {
        await db.query('UPDATE roots SET root_lock = 0 WHERE root_id = ?', [root_id]);
        res.send('Root prompt unlocked successfully');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/createNode', async (req, res) => {
    console.log('[engine.js] POST /createNode ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    const { root_id, bias } = req.query;

    if (!root_id || !bias ) {
        return res.status(400).json({ error: 'root_id and bias are required' }); // Return early with error response
    }

    // check in branches table if a branch exists with the same root_id
    try {
        const [rows] = await db.query('SELECT * FROM branches WHERE root_id = ?', [root_id]);

        if (!rows) {
            console.log('No branches found for root_id:', root_id);
            await db.query('INSERT INTO branches (root_id, branch_id) VALUES (?, ?)', [root_id, 0]);

            const [root] = await db.query('SELECT * FROM roots WHERE id = ?', [root_id]);
            const prompt = root.prompt;

            const requestData = {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: promptRules
                    },
                    {
                        role: 'system',
                        content: prompt
                    }
                ]
            };
    
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openai_key}`,
            };
    
            const response = await axios.post(apiUrl, requestData, { headers });
    
            const chatResponse = response.data.choices[0].message.content;
            console.log('chatResponse:', chatResponse);

            const chatResponseJSON = JSON.parse(chatResponse);
            const title = chatResponseJSON.title;
            const content = chatResponseJSON.content;
            console.log('title:', title);
            console.log('content:', content);

            // create new node on branch
            await insertNewNode(root_id, 0, title, content);

            // create new node on branch
            await db.query('INSERT INTO nodes (root_id, branch_id, title, content) VALUES (?, ?, ?, ?)', [root_id, 0, title, content]);
        } else {
            // find the branch_id with the highest value
            const branch_id = await getLatestBranch(root_id);
            console.log('latest branch_id:', branch_id);

            // get array of nodes on the branch
            const [rows] = await db.query('SELECT * FROM nodes WHERE root_id = ? AND branch_id = ? ORDER BY id DESC LIMIT 1', [root_id, branch_id]);
            console.log('rows:', [rows]);

            const requestData = {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: promptRules
                    },
                    {
                        role: 'system',
                        content: `Make the prediction have a ${bias} outcome.`
                    },
                    {
                        role: 'system',
                        content: rows.content
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
            console.log('chatResponse:', chatResponse);

            const chatResponseJSON = JSON.parse(chatResponse);
            const title = chatResponseJSON.title;
            const content = chatResponseJSON.content;
            console.log('title:', title);
            console.log('content:', content);

            // create new node on branch
            await insertNewNode(root_id, branch_id, title, content);
            
        }

        res.send('Node created successfully');

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }

});

router.get('/getRoot', async (req, res) => {
    console.log('[engine.js] GET /getRoot ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const { root_id } = req.query;
    console.log ('params:', req.query);

    try{
        // For given root_id, get the root info
        // Fetch all the related branches for the root
        // Get all of the nodes for each branch
        // Send the response back to the client

        const [root] = await db.query('SELECT * FROM roots WHERE id = ?', [root_id]);
        const branches = await db.query('SELECT branch_id, root_id FROM branches WHERE root_id = ?', [root_id]);
        const numBranches = Object.keys(branches).length;
        //console.log('branches:', branches);
        //console.log('branches length:', numBranches);
        const nodes = [];
        for(let i = 0; i < numBranches; i++){
            let branch_id = branches[i].branch_id;
            //console.log('branch_id:', branch_id);
            const node = await db.query('SELECT * FROM nodes WHERE root_id = ? AND branch_id = ?', [root_id, branch_id]);
            //console.log('node:', node);
            //const numNodes = Object.keys(node).length;
            //console.log('numNodes:', numNodes);
            nodes.push(node);
        }

        console.log('root:', root);
        console.log('branches:', branches);
        console.log('nodes:', nodes);
        res.json({ root, branches, nodes });

    }catch(error){
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/prediction', async (req, res) => {
    console.log('[engine.js] POST /prediction ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    const { prompt } = req.query;

    try {
        // Call the function to make the API request
        const response = await createPredictionTimeline(prompt);

        // Send the response back to the client
        res.json({ response });
    } catch (error) {
        // If an error occurs, send a 500 status with an error message
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// With a root prompt, create an array of timeline which starts with the root prompt. Then use openAiRequestPrediction to create a prediction using the array of timeline as the prompt. Then add the prediction to the timeline array. Then use the new timeline array as the prompt for the next prediction. Repeat this process until the timeline array has 10 predictions. Then return the timeline array.
const createPredictionTimeline = async (prompt) => {
    try {
        let predictions = [prompt];
        let bias = 'negative';
        let prediction;
        for (let i = 0; i < 10; i++) {
            prediction = await openAiRequestPrediction(predictions.join(' '), bias);
            predictions.push(prediction);
            //console.log('predictions:', predictions);
        }
        return predictions;
    }
    catch (error) {
        console.error('Error:', error.message);
        throw new Error('Failed to create prediction timeline');
    }
}

const createPrediction = async (prompt_history, bias) => {
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
                    content: prompt_history
                }
            ]
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openai_key}`,
        };

        const response = await axios.post(apiUrl, requestData, { headers });

        const chatResponse = response.data.choices[0].message.content;

        console.log('chatResponse:', chatResponse);

        return chatResponse;

    } catch (error) {
        console.error('Error:', error.message);
        throw new Error('Failed to create prediction');
    }
}


const openAiRequestPrediction = async (prompt, bias) => {
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
}

const insertNewRoot = async (title, prompt) => {
    try {
        await db.query('INSERT INTO roots (title, prompt) VALUES (?, ?)', [title, prompt]);
    } catch (error) {
        console.error('Error executing query:', error.message);
        throw new Error('Failed to insert new root');
    }
};

const insertNewNode = async (root_id, branch_id, title, content) => {
    try {
        await db.query('INSERT INTO nodes (root_id, branch_id, title, content) VALUES (?, ?, ?, ?)', [root_id, branch_id, title, content]);
    } catch (error) {
        console.error('Error executing query:', error.message);
        throw new Error('Failed to insert new node');
    }
};

const getLatestBranch = async (root_id) => {
    try {
        const [rows] = await db.query('SELECT * FROM branches WHERE root_id = ?', [root_id]);
        console.log('rows:', rows);
        // Find largest branch_id
        let branch_id = 0;
        for(let i = 0; i < rows.length; i++){
            if(rows[i].branch_id > branch_id){
                branch_id = rows[i].branch_id;
            }
        }
        return branch_id;    
    } catch (error) {
        console.error('Error executing query:', error.message);
        throw new Error('Failed to get latest branch');
    }
};

const getBranchNodes = async (root_id, branch_id) => {
    try {
        // Get all nodes for a given branch
        // Send nodes in array
        const [rows] = await db.query('SELECT * FROM nodes WHERE root_id = ? AND branch_id = ?', [root_id, branch_id]);
        return rows;
    } catch (error) {
        console.error('Error executing query:', error.message);
        throw new Error('Failed to get branch nodes');
    }
}

// Function to make the API request to OpenAI
const openAiRequestTest = async (prompt) => {
    try {
        const requestData = {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant.'
                },
                {
                    role: 'system',
                    content: prompt
                }
            ]
        };

        // Request headers including API key
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openai_key}`,
        };

        // Make the POST request to OpenAI API
        const response = await axios.post(apiUrl, requestData, { headers });

        // Extract chat response from the API response
        const chatResponse = response.data.choices[0].message.content;

        // Return the chat response
        return chatResponse;
    } catch (error) {
        // If an error occurs during the request, throw the error for handling
        console.error('Error during API request:', error.message);
        throw new Error('Failed to fetch chat response from OpenAI API');
    }
}

module.exports = router;
