const { putMetric } = require('../services/cloudwatch.service');
const logger = require('../utils/logger')

const requestLogger = (req,res,next)=>{
    const startTime = Date.now()

    res.on("finish",async()=>{
        const duration = Date.now() - startTime;
        await putMetric("RequestCount",1,"Count");
        await putMetric(
            "RequestLatency",
            duration,"Milliseconds"
        )
        if(res.statusCode >= 500){
            await putMetric("5xxErrorCount",1,"Count")
        }

        logger.info("HTTP Request",{
            requestId:req.requestId,
            userId:req.user?.user_id || null,
            route:req.originalUrl,
            method:req.method,
            statusCode: res.statusCode,
            duration:`${duration}ms` 
        })
    })
    next();
}

module.exports = requestLogger;