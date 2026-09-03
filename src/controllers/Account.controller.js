import {
    createAccount,
    getAllAccounts,
    getAccountBalance
} from '../services/account.service.js'

async function createAccountController(req, res) {
    const account = await createAccount(req.user._id)
    res.status(201).json({ account })
}

async function getAllAccountsController(req, res) {
    const accounts = await getAllAccounts(req.user._id)
    res.status(200).json({ accounts })
}

async function getAccountBalanceController(req, res) {
    try {
        const accountBalance = await getAccountBalance(req.params.accountId, req.user._id)
        res.status(200).json(accountBalance)
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message })
    }
}

export {
    createAccountController,
    getAllAccountsController,
    getAccountBalanceController
}
