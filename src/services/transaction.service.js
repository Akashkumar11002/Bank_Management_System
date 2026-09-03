import mongoose from 'mongoose'
import transactionModel from '../models/transaction.model.js'
import ledgerModel from '../models/ledger.model.js'
import accountModel from '../models/Account.model.js'
import userModel from '../models/user.model.js'
import { sendTransactionEmail } from './email.service.js'

function serviceError(message, statusCode = 400) {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
}

async function findTransactionAccounts(fromAccount, toAccount) {
    const senderAccount = await accountModel.findById(fromAccount)
        .populate('user', 'email name')
    const receiverAccount = await accountModel.findById(toAccount)
        .populate('user', 'email name')

    if (!senderAccount || !receiverAccount) {
        throw serviceError('Invalid account IDs provided')
    }

    return { senderAccount, receiverAccount }
}

async function transferFunds({ fromAccount, toAccount, amount, idempotencyKey }) {
    const { senderAccount, receiverAccount } = await findTransactionAccounts(fromAccount, toAccount)
    const existingTransaction = await transactionModel.findOne({ idempotencyKey })

    if (existingTransaction) {
        return { existingTransaction }
    }

    if (senderAccount.status !== 'ACTIVE' || receiverAccount.status !== 'ACTIVE') {
        throw serviceError('Both accounts must be ACTIVE to perform a transaction')
    }

    const balance = await senderAccount.getBalance()
    if (balance < amount) {
        throw serviceError(`Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`)
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: 'PENDING'
        }], { session }))[0]

        await ledgerModel.create([{
            account: fromAccount,
            amount,
            transaction: transaction._id,
            type: 'DEBIT'
        }], { session })

        await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: 'CREDIT'
        }], { session })

        transaction.status = 'COMPLETED'
        await transaction.save({ session })
        await session.commitTransaction()

        return { transaction, senderAccount, receiverAccount }
    } catch (error) {
        await session.abortTransaction()
        throw serviceError('Transaction failed. Please try again later.', 400)
    } finally {
        session.endSession()
    }
}

async function createInitialFunds({ toAccount, amount, idempotencyKey, userId }) {
    const receiverAccount = await accountModel.findById(toAccount)
    if (!receiverAccount) {
        throw serviceError('Invalid account ID provided')
    }

    const systemUser = await userModel.findById(userId).select('+systemUser')
    if (!systemUser || !systemUser.systemUser) {
        throw serviceError('User is not a system user', 403)
    }

    const systemAccount = await accountModel.findOne({ user: systemUser._id })
    if (!systemAccount) {
        throw serviceError('System account not found')
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const transaction = new transactionModel({
            fromAccount: systemAccount._id,
            toAccount: receiverAccount._id,
            amount,
            idempotencyKey,
            status: 'PENDING'
        })

        await ledgerModel.create([{
            account: systemAccount._id,
            amount,
            transaction: transaction._id,
            type: 'DEBIT'
        }], { session })

        await ledgerModel.create([{
            account: receiverAccount._id,
            amount,
            transaction: transaction._id,
            type: 'CREDIT'
        }], { session })

        transaction.status = 'COMPLETED'
        await transaction.save({ session })
        await session.commitTransaction()

        return transaction
    } catch (error) {
        await session.abortTransaction()
        throw serviceError('Initial funds transaction failed.', 400)
    } finally {
        session.endSession()
    }
}

async function sendTransferEmail(senderAccount, receiverAccount, amount, transactionId) {
    try {
        await sendTransactionEmail(
            senderAccount.user.email,
            senderAccount.user.name,
            amount,
            receiverAccount._id
        )
        return true
    } catch (error) {
        console.error('Transaction email failed:', error.message)
        return false
    }
}

export {
    transferFunds,
    createInitialFunds,
    sendTransferEmail
}
