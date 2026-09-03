const openapiSpecification = {
    openapi: '3.0.3',
    info: {
        title: 'Bank Transaction API',
        version: '1.0.0',
        description: 'Authentication, account, and transaction APIs.'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local development server'
        }
    ],
    tags: [
        { name: 'Authentication' },
        { name: 'Accounts' },
        { name: 'Transactions' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            },
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'token'
            }
        },
        schemas: {
            UserCredentials: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', format: 'password', minLength: 6, example: 'secret123' },
                    name: { type: 'string', example: 'John Doe' }
                }
            },
            Account: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '665c7f4f6f4f4f4f4f4f4f4f' },
                    user: { type: 'string' },
                    status: { type: 'string', enum: ['ACTIVE', 'FROZEN', 'CLOSED'] },
                    currency: { type: 'string', example: 'INR' }
                }
            },
            TransactionRequest: {
                type: 'object',
                required: ['fromAccount', 'toAccount', 'amount', 'idempotencyKey'],
                properties: {
                    fromAccount: { type: 'string' },
                    toAccount: { type: 'string' },
                    amount: { type: 'number', minimum: 0.01, example: 500 },
                    idempotencyKey: { type: 'string', example: 'transfer-2026-0001' }
                }
            },
            InitialFundsRequest: {
                type: 'object',
                required: ['toAccount', 'amount', 'idempotencyKey'],
                properties: {
                    toAccount: { type: 'string' },
                    amount: { type: 'number', minimum: 0.01, example: 10000 },
                    idempotencyKey: { type: 'string', example: 'initial-funds-2026-0001' }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    status: { type: 'string' }
                }
            }
        }
    },
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register a user',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCredentials' } } }
                },
                responses: {
                    201: { description: 'User registered successfully' },
                    422: { description: 'User already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                }
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Log in a user',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCredentials' } } }
                },
                responses: {
                    200: { description: 'Login successful' },
                    401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                }
            }
        },
        '/api/auth/logout': {
            post: {
                tags: ['Authentication'],
                summary: 'Log out the current user',
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                responses: {
                    200: { description: 'Logout successful' },
                    401: { description: 'Token missing or invalid' }
                }
            }
        },
        '/api/account': {
            post: {
                tags: ['Accounts'],
                summary: 'Create an account',
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                responses: {
                    201: { description: 'Account created' },
                    401: { description: 'Unauthorized' }
                }
            },
            get: {
                tags: ['Accounts'],
                summary: 'List the authenticated user accounts',
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                responses: {
                    200: { description: 'Accounts returned', content: { 'application/json': { schema: { type: 'object', properties: { accounts: { type: 'array', items: { $ref: '#/components/schemas/Account' } } } } } } },
                    401: { description: 'Unauthorized' }
                }
            }
        },
        '/api/account/balance/{accountId}': {
            get: {
                tags: ['Accounts'],
                summary: 'Get an account balance',
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                parameters: [{ name: 'accountId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Balance returned' },
                    404: { description: 'Account not found' }
                }
            }
        },
        '/api/transaction': {
            post: {
                tags: ['Transactions'],
                summary: 'Transfer funds between accounts',
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionRequest' } } }
                },
                responses: {
                    201: { description: 'Transaction completed' },
                    400: { description: 'Invalid transaction or insufficient balance' },
                    401: { description: 'Unauthorized' }
                }
            }
        },
        '/api/transaction/system/initial-funds': {
            post: {
                tags: ['Transactions'],
                summary: 'Add initial funds to an account',
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/InitialFundsRequest' } } }
                },
                responses: {
                    201: { description: 'Initial funds transaction completed' },
                    403: { description: 'User is not a system user' },
                    401: { description: 'Unauthorized' }
                }
            }
        }
    }
}

export default openapiSpecification
