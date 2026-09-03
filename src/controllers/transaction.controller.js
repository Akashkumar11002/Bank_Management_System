import {
    transferFunds,
    createInitialFunds,
    sendTransferEmail
} from '../services/transaction.service.js'

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: 'Missing required fields: fromAccount, toAccount, amount, idempotencyKey',
            status: 'failed'
        })
    }

    try {
        const result = await transferFunds({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey
        })

        if (result.existingTransaction) {
            const status = result.existingTransaction.status
            return res.status(200).json({
                message: `Transaction is ${status.toLowerCase()} with this idempotency key`,
                status: status.toLowerCase(),
                transaction: result.existingTransaction
            })
        }

        const emailSent = await sendTransferEmail(
            result.senderAccount,
            result.receiverAccount,
            amount,
            result.transaction._id
        )

        return res.status(201).json({
            message: 'Transaction completed successfully',
            status: 'success',
            transaction: result.transaction,
            emailSent
        })
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
            status: 'failed'
        })
    }
}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: 'Missing required fields: toAccount, amount, idempotencyKey',
            status: 'failed'
        })
    }

    try {
        const transaction = await createInitialFunds({
            toAccount,
            amount,
            idempotencyKey,
            userId: req.user._id
        })

        return res.status(201).json({
            message: 'Initial funds transaction completed successfully',
            status: 'success',
            transaction
        })
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
            status: 'failed'
        })
    }
}

export const transactionController = {
    createTransaction,
    createInitialFundsTransaction
}
