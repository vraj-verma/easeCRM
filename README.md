# easeCRM API

**Version**: 0.0.1  
**Author**: Sumit Verma  

**Description**:  
easeCRM is an application designed to streamline relationships for effortless business growth. It provides an API for managing accounts, users, contacts, profiles, API keys, and more. This documentation outlines the available endpoints and their usage.

The API is built with NestJS, a progressive Node.js framework for building efficient and scalable server-side applications. It uses TypeScript for its source code, providing a strong type system and other benefits.

## Table of Contents
- [easeCRM API](#easecrm-api)
  - [Table of Contents](#table-of-contents)
- [API Documentation](#api-documentation)
  - [Auth Controller](#auth-controller)
    - [Routes:](#routes)
  - [Profile Controller](#profile-controller)
    - [Routes:](#routes-1)
  - [ApiKey Controller](#apikey-controller)
    - [Routes:](#routes-2)
  - [Account Controller](#account-controller)
    - [Routes:](#routes-3)
  - [User Controller](#user-controller)
    - [Routes:](#routes-4)
  - [Contact Controller](#contact-controller)
    - [Routes:](#routes-5)

# API Documentation

## Auth Controller

### Routes:

- **`POST /v1/api/auth/signup`**
  - Description: Create an account.

- **`POST /v1/api/auth/signin`**
  - Description: Sign in to account and receive a JWT token.

- **`GET /v1/api/auth/verify-account`**
  - Description: Verify account and access account.

- **`POST /v1/api/auth/forgot-password`**
  - Description: Forgot password.

- **`GET /v1/api/auth/google`**
  - Description: Sign in with Google.

## Profile Controller

### Routes:

- **`POST /v1/api/profile/avatar`**
  - Description: Upload avatar.

- **`PATCH /v1/api/profile/remove-avatar`**
  - Description: Remove avatar.

## ApiKey Controller

### Routes:

- **`POST /v1/api/apikey`**
  - Description: Create an API key.

- **`GET /v1/api/apikey`**
  - Description: Retrieve API keys.

- **`DELETE /v1/api/apikey`**
  - Description: Delete an API key or API keys.

- **`GET /v1/api/apikey/{apikey}`**
  - Description: Retrieve an API key by key.

- **`GET /v1/api/apikey/reset`**
  - Description: Reset an API key.

- **`PATCH /v1/api/apikey/switch-status`**
  - Description: Toggle API key status.

## Account Controller

### Routes:

- **`GET /v1/api/account`**
  - Description: Retrieve an account.

- **`PUT /v1/api/account`**
  - Description: Update an account.

- **`DELETE /v1/api/account`**
  - Description: Delete an account.

## User Controller

### Routes:

- **`POST /v1/api/user/invite`**
  - Description: Invite a new user via email.

- **`POST /v1/api/user/join/{token}`**
  - Description: Join and set password.

- **`POST /v1/api/user/update-password`**
  - Description: Update password.

- **`DELETE /v1/api/user`**
  - Description: Delete the logged-in user.

## Contact Controller

### Routes:

- **`POST /v1/api/contact`**
  - Description: Create contact.

- **`GET /v1/api/contact`**
  - Description: Retrieve contacts.

- **`DELETE /v1/api/contact`**
  - Description: Delete contact by contact ID(s).

- **`GET /v1/api/contact/{id}`**
  - Description: Retrieve contact by contact ID.

- **`PUT /v1/api/contact/{id}`**
  - Description: Update contact by contact ID.

- **`PATCH /v1/api/contact/{id}`**
  - Description: Partial update of contact by contact ID.

- **`PATCH /v1/api/contact/assign`**
  - Description: Assign contact to someone in your team.
