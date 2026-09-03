import mongoose from "mongoose";



const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required for blacklisting"],
        unique: true // Ensure that the same token cannot be blacklisted multiple times
    },
    
},{
    timestamps: true // Automatically add createdAt and updatedAt fields
})

tokenBlacklistSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 60 * 60 * 24 * 7 // 7 days
    }
);


const tokenBlacklistModel = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

export default tokenBlacklistModel