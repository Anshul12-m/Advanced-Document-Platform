require("dotenv").config();
const express = require('express');

const requestId = require("./src/middleware/requestId.middleware")
const requestLogger = require("./src/middleware/logging.middleware")

const authRouter = require('./src/routes/auth.Routes')
const documentRouter =require('./src/routes/document.Routes')
const healthRouter = require('./src/routes/health.Routes')
const readyRouter = require('./src/routes/ready.Routes')
const port = 6000

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(requestId);
app.use(requestLogger);

app.use('/',documentRouter)
app.use('/',authRouter)
app.use('/',healthRouter)
app.use('/',readyRouter)
app.get('/',(req,res)=>{
    res.send("server is running");

})


app.listen(port,()=>{
    console.log("server chl rah hai 6000 port pe")
})