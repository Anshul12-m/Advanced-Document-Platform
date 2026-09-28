const express = require('express');

const readyRouter = express.Router()

readyRouter.get('/api/ready',(req,res)=>{
    res.status(200).json({
        success:true,
        status:"ready",
        service:"Advanced-Document-Platform"
    })
})

module.exports = readyRouter