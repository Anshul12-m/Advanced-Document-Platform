const {SNSClient,PublishCommand} = require('@aws-sdk/client-sns')
const { v4: uuidv4 } = require("uuid");
const sns = new SNSClient({
    region:process.env.AWS_S3_REGION,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
    }
})


const uploadNotification = async(data)=>{

    const message = {
        eventType:"Document-Uploaded",
        eventId: uuidv4(),
        userId: data.userId,
        objectKey:data.objectKey,
        bucket: process.env.AWS_S3_BUCKET,
        filename: data.fileName,
        uploadedAt: new Date().toISOString()
    }

  console.log("SNS message:", message);


    const command = new PublishCommand({
        TopicArn:process.env.SNS_TOPIC_ARN,
        Subject:"Document Uploaded",
        Message:JSON.stringify(message,null,2)
    })

     const response =  await sns.send(command)
      console.log("SNS Publish Success:", response.MessageId);
      return response;
}

module.exports = uploadNotification;