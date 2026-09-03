import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema({

    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Transaction must be associated with a from account'],
        index: true // index for faster queries filtering by fromAccount},
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Transaction must be associated with a to account'],
        index: true // index for further queries filtering by toAccount
    },

    status:{
        type: String,
        enum:{
            values: ["PENDING","COMPLETED","FAILED","REVERSED"],
        },
        default: "PENDING"
    },

    amount: {
        type: Number,
        required: [true, "Amount is required for creating a transaction"],
        min: [0, "Transaction amount can not be negative or zero"]
    },

    idempotencyKey: {// unique identifier for the transaction to ensure idempotency
        type: String,
        required: [true, "Idempotency key is required for creating a transaction"],
        index: true,
        unique: true // unique index to ensure idempotency key is unique across transactions
    } 


},{
    timestamps: true
})


 const transactionModel = mongoose.model('Transaction', transactionSchema)
 export default transactionModel