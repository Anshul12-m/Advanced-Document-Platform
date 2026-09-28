const express = require('express')

const healthRouter = express.Router()

healthRouter.get('/api/health',(req,res)=>{
    res.status(200).json({
        sucess:true,
        status:"healthy",
        service:"Advance-Document-Platform"

    })
})

module.exports= healthRouter