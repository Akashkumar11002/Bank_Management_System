import accountModel from '../models/account.model.js'

async function createAccount(userId) {
    return accountModel.create({ user: userId })
}

async function getAllAccounts(userId) {
    return accountModel.find({ user: userId })
}

async function getAccountBalance(accountId, userId) {
    const account = await accountModel.findOne({
        _id: accountId,
        user: userId
    })

    if (!account) {
        const error = new Error('Account not found')
        error.statusCode = 404
        throw error
    }

    return {
        accountId: account._id,
        balance: await account.getBalance()
    }
}

export {
    createAccount,
    getAllAccounts,
    getAccountBalance
}
