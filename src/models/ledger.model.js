import mongoose from "mongoose";    




const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Ledger must be associated with an account"],
        index: true,
        immutable: true // once a ledger is created, it should not be changed
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for creating a ledger entry"],
        immutable: true
    },

    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "Ledger must be associated with a transaction"],
        index: true,
        immutable: true
    },
    type:{
        type: String,
        enum: {
            values: ["CREDIT","DEBIT"],
            message: "Ledger type can be either CREDIT or DEBIT",
        },
        required: [true, "Ledger type is required for creating a ledger entry"],
        immutable: true
    }

    
})

function preventLedgerModification() {
    throw new Error("Ledger entries are immutable and cannot be modified or deleted.");
}
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);

const ledgerModel = mongoose.model('Ledger', ledgerSchema)

export default ledgerModel