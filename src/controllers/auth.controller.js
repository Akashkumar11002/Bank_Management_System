import userModel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { sendRegistrationEmail } from '../services/email.service.js'
import tokenblacklistModel from '../models/blackList.model.js'

/**
 * 
 * - user  register controller
 * - POST/spi/auth/register
 */


async function userRegisterController(req, res) {
    const { email, password ,name} = req.body

    const isExist=await userModel.findOne({
        email:email
    })

    if(isExist){
        return res.status(422).json({
            message:"User already exists with email.",
            status: "failed"
        })
    }

    const user=await userModel.create({
        email:email,
        password:password,
        name:name
    })


    const token=jwt.sign({userId: user.id},
        process.env.
        jwt_secret,
        {
        expiresIn:"3d"
        }
);
    

    // Send the email before reporting a completed registration.
    try {
        await sendRegistrationEmail(user.email, user.name)
    } catch (error) {
        console.error('Registration email failed:', error)
        return res.status(502).json({
            message: 'Registration email could not be sent.',
            status: 'failed'
        })
    }

    res.cookie("token",token)
    return res.status(201).json({
        user:{
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    })
}

/**
 * - user Login controller
 * - POST /api/auth/login
 */


async function userLoginController(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({
        email
    }).select('+password') // Include password field in the query result

    if (!user) {
        return res.status(401).json({
            message: "Email or password is incorrect.",
            status: "failed"
        })
    }

    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
        return res.status(401).json({
            message: "Email or password is incorrect.",
            status: "failed"
        })
    }

    const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, {
        expiresIn: "3d"
    })

    res.cookie("token", token)
    res.status(200).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    })
}



/**
 * -User logout controller
 * -POST /api/auth/logout
 */

async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(200).json({
            message: "Token is missing.",
            status: "failed"
        })
    }

    

    await tokenblacklistModel.create({
        token: token,
    })

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully.",
        status: "success"
    })



}

export {
    userRegisterController,
    userLoginController,
    userLogoutController
}


