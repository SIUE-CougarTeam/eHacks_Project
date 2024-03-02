const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../db');

router.post('/', (req, res) => {
  console.log('[users.js] POST / ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  res.send('Debugging GET /users');
});

router.get('/', (req, res) => {
  console.log('[users.js] GET / ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  res.send('Debugging GET /users');
});

// getUsers
router.get('/getUsers', async (req, res) => {
  console.log('[users.js] GET /getUsers ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

  const skeletonKey = req.headers['x-skeleton-key'];
  if(!skeletonKey){
    return res.status(401).json({ error: 'Missing x-skeleton-key header' });
  }else if(skeletonKey != process.env.SKELETON_KEY){
    return res.status(401).json({ error: 'Invalid x-skeleton-key header' });
  }

  try {
    const users = await db.query('SELECT * FROM ehacks_users');
    res.json(users);
  } catch (error) {
    console.error('Error querying the database:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// getUser
router.post('/getUser', async (req, res) => {
  console.log('[users.js] POST /getUser', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

  const {username} = req.body;

  if(!username){
    return res.status(400).json({ error: `Missing required fields - username: ${username}` });
  }

  try{
    const [user] = await db.query('SELECT user_id, username, created_at, password_last_updated, active, account_lock FROM ehacks_users WHERE username = ?', [username]);
    return res.status(200).json(user);
  }catch(error){
    console.error('Error querying the database:', error);
    return res.status(500).json({ error: 'An error occurred' });
  }
});

// addUser
router.post('/addUser', async (req, res) => {
  console.log('[users.js] POST /addUser ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

  const { username, password } = req.body;

  console.log('[users.js] Create user with username: ', username, ', password: ', password);

  if (!username || !password) {
    return res.status(400).json({ error: `Missing required fields - username: ${username}, password: ${password}` });
  }

  try {
    //check if username already exists
    const users = await db.query('SELECT * FROM ehacks_users WHERE username = ?', [username]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    } else {
      const salt = generateRandomSalt();
      const hashedPassword = await hashPasswordAsync(password + salt);
      const newUser = await db.query('INSERT INTO ehacks_users (username, password_hash, salt) VALUES (?, ?, ?)', [username, hashedPassword, salt]);
      return res.status(200).json({ success: 'User successfully added' });
    }
  } catch (error) {
    console.error('Error querying the database:', error);
    return res.status(500).json({ error: 'An error occurred' });
  }

});

// auththenticateUsername
router.post('/authenticateUsername', async (req, res) => {
  console.log('[users.js] POST /authenticateUsername ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));

  const {username, password} = req.body;

  if(!username || !password){
    return res.status(400).json({ error: `Missing required fields - username: ${username}, password: ${password}` });
  }

  const user_id = await getUserIdByUsername(username);
  const result = await authenticateUser(user_id, password);

  if(result){
    console.log('[users.js] Access granted for user: ', username);
    return res.status(200).json({ result: 'true' });
  }else{
    console.log('[users.js] Access denied for user: ', username);
    return res.status(400).json({ result: 'false' });
  }

});

router.post('/unlockAccount', async (req, res) => {
  console.log('[users.js] POST /unlockAccount ', new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const skeletonKey = req.headers['x-skeleton-key'];
  if(!skeletonKey){
    return res.status(401).json({ error: 'Missing x-skeleton-key header' });
  }else if(skeletonKey != process.env.SKELETON_KEY){
    return res.status(401).json({ error: 'Invalid x-skeleton-key header' });
  }

  const username = req.body.username;
  if(!username){
    return res.status(400).json({ error: `Missing required fields - username: ${username}` });
  }

  const user_id = await getUserIdByUsername(username);
  if(!user_id){
    return res.status(400).json({ error: `User not found` });
  }

  try{
    const success = await unlockAccount(user_id);
    if(success){
      res.status(200).json({ success: 'Account successfully unlocked' });
    }else{
      res.status(500).json({ error: 'An error occurred' });
    }
  }catch(error){
    console.error('Error querying the database:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

async function updateUserPassword(user_id, newPassword) {
  try{
    const salt = generateRandomSalt();
    const hashedPassword = await hashPasswordAsync(newPassword + salt);
    const newUser = await db.query('UPDATE ehacks_users SET password_hash = ?, salt = ? WHERE user_id = ?', [hashedPassword, salt, user_id]);
    return true;
  }catch(error){
    console.error('Error querying the database:', error);
    return false;
  }
}

async function getUserIdByUsername(username) {
  try{
    const user = await db.query('SELECT * FROM ehacks_users WHERE username = ?', [username]);
    return user[0].user_id;
  }catch(error){ 
    console.error('Error querying the database:', error);
    return false;
  }
}

// function to take in a user_id and password and return true if the password matches the user_id
async function authenticateUser(user_id, password) {
  try{
    user = await db.query('SELECT * FROM ehacks_users WHERE user_id = ?', [user_id]);
    const {password_hash, salt} = user[0];
    const hashedPassword = await unhashPasswordAsync(password + salt, password_hash);

    return hashedPassword;
  }catch(error){
    console.error('Error querying the database:', error);
    return false
  }
}

async function unlockAccount(user_id) {
  try{
    const lock = await db.query('UPDATE ehacks_users SET account_lock = 0 WHERE user_id = ?', [user_id]);
    return true;
  }catch(error){
    console.error('Error querying the database:', error);
    return false;
  }
}

function unhashPasswordAsync(password, salt) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, salt);
}

function hashPasswordAsync(password) {
  const bcrypt = require('bcryptjs');
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

function generateRandomSalt() {
  return Math.random().toString(36).substring(2, 18);
}

router.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../', '404.html'));
});

module.exports = router;
