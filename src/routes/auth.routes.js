import express from 'express'


import {
    userRegisterController,
    userLoginController,
    userLogoutController
} from '../controllers/auth.controller.js'



// import authController from '../controllers/auth.controller.js'
const router = express.Router()

/*POST /api/auth/register*/
router.post('/register',userRegisterController)


/* POST /api/auth/login */
router.post('/login', userLoginController)


/** 
 * GET /api/auth/logout
 */

router.post('/logout',userLogoutController)


export default router


