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

You can install these dependencies by running:

```bash
npm install express dotenv mysql2 bcryptjs promise

## Base URL
The base URL for accessing the API endpoints is:
https://ehacks-api.enginiumtech.com/

## Authentication
All API requests require authentication via an API key (`x-api-key` header) and, for certain endpoints, a skeleton key (`x-skeleton-key` header). Please ensure you include these headers in your requests.

### Headers
- `x-api-key`: Your API key for authentication.
- `x-skeleton-key`: A special key required for specific endpoints.

## Endpoints

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
