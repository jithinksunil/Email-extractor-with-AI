import express from 'express'
import { genaratePassword } from '../controller/userController.js'
const router=express.Router()

router.post('/genarate/password',genaratePassword)

export default router