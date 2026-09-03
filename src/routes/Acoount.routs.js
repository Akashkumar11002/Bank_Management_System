import express from 'express'
import authmiddleware from '../middleware/auth.middleware.js'
import {
    createAccountController,
    getAllAccountsController,
    getAccountBalanceController
} from '../controllers/Account.controller.js'

const router = express.Router()

/**
 * POST /api/account/
 * create a new account for the authenticated user
 * protected route
 */
router.post('/', authmiddleware, createAccountController)

/**
 * GET /api/account/
 * Get all account for the logged in user
 * protected route
 */
router.get('/', authmiddleware, getAllAccountsController)

/**
 * GET /api/account/balance/:accountId
 */
router.get('/balance/:accountId', authmiddleware, getAccountBalanceController)

export default router


