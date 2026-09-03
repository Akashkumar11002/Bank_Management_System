import express from 'express'

import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import openapiSpecification from './docs/openapi.js'



const app = express()


app.use(express.json())
app.use(cookieParser())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.get('/api-docs.json', (req, res) => res.json(openapiSpecification))

/**
 * - Routes Required
 */


import authRoutes from './routes/auth.routes.js'
import accountRoutes from './routes/Acoount.routs.js'      
import transactionRoutes from './routes/transaction.routs.js'

/**
 * - Use Routes
 */


app.use("/api/auth", authRoutes)
app.use("/api/account", accountRoutes)
app.use("/api/transaction", transactionRoutes)
export default app