import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid'],
        unique: [true, 'Email already exists'],
    },
    name: {
        type: String,
        required: [true, 'Name is required for creating an account'],
    
    },
    password: {
        type: String,
        required: [true, 'Password is required for creating an account'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false, // Exclude password from query results by default
    },
    systemUser: {
        type: Boolean,
        default: false,
        immutable: true ,// once a user is created, it should not be changed
        select: false // Exclude systemUser from query results by default
    },
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
})
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return 
    }
    try {
        this.password = await bcrypt.hash(this.password, 10)

        return 
    } catch (error) {
        return
    }
})

userSchema.methods.comparePassword = async function (Password) {
    return bcrypt.compare(Password, this.password)// it will compare the password entered by user with the hashed password stored in the database and return true or false
}


const userModel = mongoose.model('User', userSchema)
export default userModel

