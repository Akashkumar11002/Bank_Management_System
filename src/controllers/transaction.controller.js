import transactionmodel from '../models/transaction.model.js';
import ledgermodel from '../models/ledger.model.js';
import { sendTransactionEmail } from '../services/email.service.js';
import AccountModel from '../models/Account.model.js';
import userModel from '../models/user.model.js';
import mongoose from 'mongoose';

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request  
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */


 async function createTransaction(req, res) {
    /**
     * 1. Validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields: fromAccount, toAccount, amount, idempotencyKey",
            status: "failed"
        });
    }
    const fromUserAccount = await AccountModel.findOne({
        _id: fromAccount
    }).populate('user', 'email name');
    const toUserAccount = await AccountModel.findOne({
        _id: toAccount
    }).populate('user', 'email name');
    
    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid account IDs provided",
            status: "failed"
        });
    }

    /**
    * 2. Validate idempotency key 
    */ 

    const isTransactionAlreadyExists = await transactionmodel.findOne({ idempotencyKey: idempotencyKey });

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already completed with this idempotency key",
                status: "success",
                transaction: isTransactionAlreadyExists
            });
        }
        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still pending with this idempotency key",
                status: "pending",
                
            });
        }

        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(200).json({
                message: "Transaction has failed with this idempotency key",
                
            });
        }

        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(200).json({
                message: "Transaction has been reversed with this idempotency key",
                
            });
        }

    }


    /**
     * 3. Check account status
     */

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "Both accounts must be ACTIVE to perform a transaction",
            
        });

    }

    /**
     * 4. Derive sender balance from ledger
     */


    const balance=await fromUserAccount.getBalance();
    if(balance<amount){
        return res.status(400).json({
            message:`Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
            
        });
    }

    // let transaction;
    // try {

        /**
         * 5. Create transaction (PENDING)
         */
        let transaction;
        try {

        const session = await mongoose.startSession();
        session.startTransaction();


        // const session = await transactionmodel.startSession();
        // session.startTransaction();

        transaction = (await transactionmodel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0];

        const debitLedgerEntry = await ledgermodel.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })();


        const creditLedgerEntry = await ledgermodel.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        // transaction.status = "COMPLETED";
        // await transaction.save({ session });

        await transactionmodel.findOneAndUpdate(
            { _id: transaction._id },
            {  status: "COMPLETED"  },
            { session}
        );

        await session.commitTransaction();
        session.endSession();

    } catch (error) {
        
        return res.status(400).json({
            message: "Transaction is PENDING due to an error. Please try again later.",
        });

    }

        /**
         * 10. send email notification
         */

        let emailSent = true;
        try {
            await sendTransactionEmail(
                fromUserAccount.user.email,
                fromUserAccount.user.name,
                amount,
                toUserAccount._id
            );
        } catch (error) {
            emailSent = false;
            console.error('Transaction email failed:', error.message);
        }

        return res.status(201).json({
            message: "Transaction completed successfully",
            status: "success",
            transaction: transaction,
            emailSent
        });
        
      
    }



 async function createInitialFundsTransaction(req, res) {
   const { toAccount, amount, idempotencyKey } = req.body;

   if (!toAccount || !amount || !idempotencyKey) {
       return res.status(400).json({
           message: "Missing required fields: toAccount, amount, idempotencyKey",
           status: "failed"
       });
   }

   const toUserAccount = await AccountModel.findOne({
       _id: toAccount
   });

   if (!toUserAccount) {
       return res.status(400).json({
           message: "Invalid account ID provided",
           status: "failed"
       });
   }

   

//    const fromUserAccount = await AccountModel.findOne({
//         //  systemUser: true,
//          user: req.user._id 
         
//    });
//    if( !fromUserAccount){
//         return res.status(400).json({
//             message : "System account not found for the user",
//             status: "failed"
//         })
//    }


// Find the system user
const systemUser = await userModel
    .findById(req.user._id)
    .select('+systemUser');

if (!systemUser || !systemUser.systemUser) {
    return res.status(403).json({
        message: "User is not a system user",
        status: "failed"
    });
}

// Find the account belonging to the system user
const fromUserAccount = await AccountModel.findOne({
    user: systemUser._id
});

if (!fromUserAccount) {
    return res.status(400).json({
        message: "System account not found",
        status: "failed"
    });
}





   const session = await mongoose.startSession();
   session.startTransaction();

   const transaction = new transactionmodel({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount: amount,
        idempotencyKey: idempotencyKey,
        status: "PENDING"
   });

   const debitLedgerEntry = await ledgermodel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session });

    const creditLedgerEntry = await ledgermodel.create([{
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        meassage: "Initial funds transaction comletes successfully",
        transaction: transaction
    });




}

   export const transactionController = {
    createTransaction,
    createInitialFundsTransaction

   }

        
