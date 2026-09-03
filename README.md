# Bank Transaction API

A Node.js and Express backend for user authentication, bank account management, ledger-based balances, and account-to-account transactions. MongoDB stores users, accounts, transactions, ledger entries, and revoked tokens.

## Features

- User registration, login, and logout
- JWT authentication through an HTTP-only-compatible `token` cookie or bearer token
- Account creation and account listing
- Ledger-derived account balances
- Idempotent money transfers
- System-user initial funds transactions
- Gmail OAuth2 transaction and registration emails
- Interactive Swagger API documentation

## Tech Stack

- Node.js with ES modules
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens
- Nodemailer with Gmail OAuth2
- Swagger UI and OpenAPI 3

## Requirements

- Node.js 18 or newer
- npm
- MongoDB database
- Gmail OAuth2 credentials for email notifications

## Installation

```bash
git clone <repository-url>
cd Backend_Project
npm install
```

Create `src/.env` from [`src/.env.example`](src/.env.example). Keep this file private and never commit real credentials:

```env
MONGO_URI=mongodb://localhost:27017/bank_transaction_system
jwt_secret=replace-with-a-long-random-secret
CLIENT_ID=your-google-oauth-client-id
CLIENT_SECRET=your-google-oauth-client-secret
REFRESH_TOKEN=your-google-oauth-refresh-token
EMAIL_USER=your-gmail-address
```

## Run the API

Development mode with automatic restart:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server runs on `http://localhost:3000`.

## API Documentation

Open the interactive Swagger UI after starting the server:

```text
http://localhost:3000/api-docs
```

The raw OpenAPI document is available at:

```text
http://localhost:3000/api-docs.json
```

## Authentication

Register or log in to receive a JWT. The API also sets the token in a cookie named `token`.

For bearer authentication, send:

```http
Authorization: Bearer <jwt-token>
```

Protected endpoints accept either the bearer token or the `token` cookie.

## Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in a user | No |
| `POST` | `/api/auth/logout` | Revoke the current token | Token |

Registration and login request example:

```json
{
  "email": "user@example.com",
  "password": "secret123",
  "name": "John Doe"
}
```

### Accounts

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/account` | Create an account for the authenticated user | Token |
| `GET` | `/api/account` | List the authenticated user's accounts | Token |
| `GET` | `/api/account/balance/{accountId}` | Get an account balance | Token |

### Transactions

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/transaction` | Transfer funds between accounts | Token |
| `POST` | `/api/transaction/system/initial-funds` | Add initial funds to an account | System user |

Transfer request example:

```json
{
  "fromAccount": "source-account-id",
  "toAccount": "destination-account-id",
  "amount": 500,
  "idempotencyKey": "transfer-unique-key-001"
}
```

Initial funds request example:

```json
{
  "toAccount": "destination-account-id",
  "amount": 10000,
  "idempotencyKey": "initial-funds-unique-key-001"
}
```

Every transaction request must use a unique `idempotencyKey`. Reusing a key returns the existing transaction instead of creating a duplicate.

## Project Structure

```text
server.js
src/
  app.js
  config/
    db.js
  controllers/       # HTTP request validation and responses
  middleware/        # JWT and system-user authentication
  models/            # Mongoose schemas
  routes/            # Express route definitions
  services/          # Business logic and external integrations
  docs/
    openapi.js       # OpenAPI specification
```

## Security Notes

- Store secrets only in environment variables.
- Do not commit `src/.env`; it is ignored by Git.
- Rotate any credentials that have previously been exposed.
- Use HTTPS and secure cookie settings in production.
- Use a production Gmail OAuth2 setup or another transactional email provider.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Issues and pull requests are welcome. Please keep changes focused, do not commit secrets, and run the available validation commands before submitting a pull request.
