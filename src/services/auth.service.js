import jwt from 'jsonwebtoken'
import userModel from '../models/user.model.js'
import tokenblacklistModel from '../models/blackList.model.js'
import { sendRegistrationEmail } from './email.service.js'

function createToken(userId) {
    return jwt.sign({ userId }, process.env.jwt_secret, {
        expiresIn: '3d'
    })
}

async function registerUser({ email, password, name }) {
    const existingUser = await userModel.findOne({ email })

    if (existingUser) {
        const error = new Error('User already exists with email.')
        error.statusCode = 422
        throw error
    }

    const user = await userModel.create({ email, password, name })
    await sendRegistrationEmail(user.email, user.name)

    return {
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token: createToken(user._id)
    }
}

async function loginUser({ email, password }) {
    const user = await userModel.findOne({ email }).select('+password')

    if (!user || !(await user.comparePassword(password))) {
        const error = new Error('Email or password is incorrect.')
        error.statusCode = 401
        throw error
    }

    return {
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token: createToken(user._id)
    }
}

async function logoutUser(token) {
    if (!token) {
        const error = new Error('Token is missing.')
        error.statusCode = 200
        throw error
    }

    await tokenblacklistModel.create({ token })
}

export {
    registerUser,
    loginUser,
    logoutUser
}
