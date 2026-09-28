const winston =  require("winston");
const WinstonCloudWatch = require("winston-cloudwatch")

const logger = winston.createLogger({
    level:'info',
    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports:[
        new winston.transports.Console(),

        new WinstonCloudWatch({
            logGroupName:"advanced-document-platform",
            logStreamName:"nodejs-app",
            awsRegion:process.env.AWS_S3_REGION
        })
    ]
})

module.exports = logger