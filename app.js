const { App, AwsLambdaReceiver } = require('@slack/bolt');

// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,

  // When using the AwsLambdaReceiver, processBeforeResponse can be omitted.
  // If you use other Receivers, such as ExpressReceiver for OAuth flow support
  // then processBeforeResponse: true is required. This option will defer sending back
  // the acknowledgement until after your handler has run to ensure your function
  // isn't terminated early by responding to the HTTP request that triggered it.

  // processBeforeResponse: true
});

app.function('function_get_account_info', async ({ client, inputs, complete, fail }) => {
  try {
    console.log(`Inputs: ${JSON.stringify(inputs)}`);
    const { user_id, channel_id, account_identifier, account_environment } = inputs;

    await client.chat.postEphemeral({
      channel: channel_id,
      user: user_id,
      text: `Greetings <@${user_id}>! You had requested account info for ${account_identifier} in ${account_environment}. Let me fetch that for you...`
    });

    await complete({ outputs: { user_id } });
  }
  catch (error) {
    console.error(error);
    fail({ error: `Failed to complete the step: ${error}` });
  }
});

// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}
