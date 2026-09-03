import { Router } from 'express'
import authMiddleware, { systemUserMiddleware } from '../middleware/auth.middleware.js'
import { transactionController } from '../controllers/transaction.controller.js'

const transactionRoutes = Router()

/**
 * POST /api/transaction/
 * create a new transaction for the authenticated user
 */
transactionRoutes.post(
    '/',
    authMiddleware,
    transactionController.createTransaction
)

/**
 * POST /api/transaction/system/initial-funds
 * Create initial funds transaction from system user
 */
transactionRoutes.post(
    '/system/initial-funds',
    systemUserMiddleware,
    transactionController.createInitialFundsTransaction
)

export default transactionRoutes