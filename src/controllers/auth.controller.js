import {
    registerUser,
    loginUser,
    logoutUser
} from '../services/auth.service.js'

async function userRegisterController(req, res) {
    try {
        const result = await registerUser(req.body)
        res.cookie('token', result.token)
        return res.status(201).json(result)
    } catch (error) {
        return res.status(error.statusCode || 502).json({
            message: error.message,
            status: 'failed'
        })
    }
}

async function userLoginController(req, res) {
    try {
        const result = await loginUser(req.body)
        res.cookie('token', result.token)
        return res.status(200).json(result)
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
            status: 'failed'
        })
    }
}

async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    try {
        await logoutUser(token)
        res.clearCookie('token')
        return res.status(200).json({
            message: 'User logged out successfully.',
            status: 'success'
        })
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
            status: 'failed'
        })
    }
}

export {
    userRegisterController,
    userLoginController,
    userLogoutController
}
