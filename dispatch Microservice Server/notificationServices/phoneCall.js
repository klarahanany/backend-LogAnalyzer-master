const { Vonage } = require('@vonage/server-sdk')
const { NCCOBuilder, Talk, OutboundCallWithNCCO } = require('@vonage/voice')
const path = require('path');

const privateKeyPath = path.join(__dirname, 'private.key');

const vonage = new Vonage({
  apiKey: process.env.APIKEY, // Replace with your actual API key
  apiSecret:  process.env.APISECRET, // Replace with your actual API secret
  applicationId: process.env.APPID, // Replace with your actual application ID
  privateKey: privateKeyPath, // Replace with the actual path to your private key file
});


async function phoneCall(phoneNumber,text) {
  try {
    console.log(privateKeyPath);
    const builder = new NCCOBuilder();
    builder.addAction(new Talk(`${text}`));
    const resp = await vonage.voice.createOutboundCall(
      new OutboundCallWithNCCO(
        builder.build(),
        { type: 'phone', number: `${phoneNumber}` }, //to Include the country code and put the number in quotes
        { type: 'phone', number: '+972524287681' } //from Include the country code and put the number in quotes
      )
    );

    console.log('Call initiated successfully:', resp);
  } catch (error) {
    console.error('Error making the call:', error);
  }
}

module.exports = phoneCall;