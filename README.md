# Database Tables

This document provides an overview of the database tables used in the application.

## Database Name: ehacks

## ehacks_users

The `ehacks_users` table stores information about users registered in the system.

### Columns

- `user_id`: Unique identifier for each user.
- `username`: User's username.
- `password_hash`: Hashed password of the user.
- `salt`: Salt used for password hashing.
- `created_at`: Timestamp indicating when the user account was created.
- `password_last_updated`: Timestamp indicating when the user's password was last updated.
- `active`: Boolean value indicating whether the user account is active.
- `account_lock`: Boolean value indicating whether the user account is locked.
