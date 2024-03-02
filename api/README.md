# API Documentation

## Introduction
Welcome to the documentation for the API provided by Sean Schuchman. This API allows you to manage user authentication, account creation, password management, and account unlocking functionalities. Below you will find details on how to use each endpoint provided by the API.

## NPM Dependencies
To use this API, you need to install the following npm dependencies:

- **express**
- **dotenv**
- **mysql2**
- **bcryptjs**
- **promise**
- **axios**

You can install these dependencies by running:

```bash
npm install express dotenv mysql2 bcryptjs promise
```

# Environment Variables

The following environment variables are required:

- `OPENAI_KEY`: Your OpenAI API key.

You can set these variables in a `.env` file in the ./api directory.

# Starting the API

To start the API server, run the following command in the project ./api directory:

```bash
node server.js
```

By default, the server will run on port 8080. You can access the API locally at http://localhost:8080.

## Base URL
The routed base URL for accessing the API endpoints is:
https://ehacks-api.enginiumtech.com/

## Authentication
All API requests require authentication via an API key (`x-api-key` header) and, for certain endpoints, a skeleton key (`x-skeleton-key` header). Please ensure you include these headers in your requests.

### Headers
- `x-api-key`: Your API key for authentication.
- `x-skeleton-key`: A special key required for specific endpoints.

# Endpoints
## /Users
### POST /users
- **Description:** Debugging endpoint to test the API.
- **Request Body:** None required.
- **Response:** Returns a simple debugging message.

### GET /users
- **Description:** Debugging endpoint to test the API.
- **Response:** Returns a simple debugging message.

### GET /users/getUsers
- **Description:** Retrieves a list of all users from the database.
- **Headers:** `x-skeleton-key` is required for authentication.
- **Response:** Returns a JSON array containing user details.

### POST /users/getUser
- **Description:** Retrieves details of a specific user by username.
- **Request Body:** JSON object with `username` field.
- **Response:** Returns JSON object with user details.

### POST /users/addUser
- **Description:** Adds a new user to the database.
- **Request Body:** JSON object with `username`, `email`, `password`, `firstName`, and `lastName` fields.
- **Response:** Success message upon adding the user.

### POST /users/authenticateUsername
- **Description:** Authenticates a user by username and password.
- **Request Body:** JSON object with `username` and `password` fields.
- **Response:** Returns a boolean indicating authentication success.

### POST /users/changePassword
- **Description:** Changes the password of a user.
- **Request Body:** JSON object with either `username`, `oldPassword`, and `newPassword` fields.
- **Response:** Success message upon password change.

### POST /users/resetPassword
- **Description:** Resets the password of a user.
- **Headers:** `x-skeleton-key` is required for authentication.
- **Request Body:** JSON object with `username` and `newPassword` fields.
- **Response:** Success message upon password reset.

### POST /users/unlockAccount
- **Description:** Unlocks the account of a user.
- **Headers:** `x-skeleton-key` is required for authentication.
- **Request Body:** JSON object with `username` field.
- **Response:** Success message upon account unlock.

## /Engine
### POST engine/createRoot

- **Description:** Creates a new root prompt and stores it in the database.
- **Request Body:**
        prompt: The prompt for the root.
        title: Title of the root.
- **Response:** Returns a success message upon successful creation.

### GET engine/getRandomRoot

- **Description:** Retrieves a random root prompt from the database.
- **Request Body:** None
- **Response:** Returns a random root prompt.

### POST engine/lockRoot

- **Description:** Locks a root prompt to prevent further modifications.
- **Request Body:**
        root_id: ID of the root to be locked.
- **Response:** Returns a success message upon successful locking.

### POST engine/unlockRoot

- **Description:** Unlocks a locked root prompt to allow modifications.
- **Request Body:**
        root_id: ID of the root to be unlocked.
- **Response:** Returns a success message upon successful unlocking.

### POST engine/createNode

- **Description:** Creates a new node associated with a root prompt.
- **Request Body:**
        root_id: ID of the root prompt.
        branch_id: ID of the branch.
        title: Title of the node.
        content: Content of the node.
- **Response:** Returns a success message upon successful creation.

### GET engine/getRoot

- **Description:** Retrieves information about a specific root prompt, including its branches and nodes.
- **Request Body:**
        root_id: ID of the root prompt.
- **Response:** Returns details about the root, its branches, and nodes.

### POST engine/prediction

- **Description:** Generates predictions based on a given prompt.
- **Request Body:**
        prompt: Prompt for generating predictions.
- **Response:** Returns predictions generated by the AI model.


