import userModel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import tokenblacklistModel from '../models/blacklist.model.js'


async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized access. Token is missing.'
        })
    }

    const isBlacklisted = await tokenblacklistModel.findOne({ token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: 'Unauthorized access. Token is invalid.'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.jwt_secret)
        const user = await userModel.findById(decoded.userId)

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized access. User not found.'
            })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized access. Invalid token.'
        })
    }
}

export async function systemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized access. Token is missing.'
        })
    }

    const isBlacklisted = await tokenblacklistModel.findOne({ token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: 'Unauthorized access. Token is invalid.'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.jwt_secret)

        const user = await userModel
            .findById(decoded.userId)
            .select('+systemUser')

        if (!user || !user.systemUser) {
            return res.status(403).json({
                message: 'Forbidden access. User is not a system user.'
            })
        }

        req.user = user
        next()

    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized access. Invalid token.'
        })
    }
}

export default authMiddleware