const express = require('express')
const {register,login} = require('../controllers/auth.controller')
const authRouter = express.Router()

authRouter.post('/api/auth/register',register);
authRouter.post('/api/auth/login',login)

module.exports = authRouter