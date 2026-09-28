const {CloudWatchClient,PutMetricDataCommand}  = require('@aws-sdk/client-cloudwatch');


const cloudwatch = new CloudWatchClient({
    region:process.env.AWS_S3_REGION,
    
})

const putMetric = async (metricName, value = 1,
    unit = "Count") => {

    try {
    const command = new PutMetricDataCommand({
      Namespace: "Advanced-Document-Platform",
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Timestamp: new Date()
        }
      ]
    });

    await cloudwatch.send(command);

    console.log(`CloudWatch metric sent: ${metricName}`);
  } catch (error) {
    console.error(
      `CloudWatch metric failed: ${metricName}`,
      error.message
    );
  }
}

module.exports={putMetric}