import express from 'express'

import cookieParser from 'cookie-parser'



const app = express()


app.use(express.json())
app.use(cookieParser())

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