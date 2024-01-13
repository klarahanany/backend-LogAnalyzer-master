
const { Vonage } = require('@vonage/server-sdk');


const vonage = new Vonage({
    apiKey:  process.env.APIKEY,
    apiSecret : process.env.APISECRET
  });
  
  async function sendSMS(toPhonnum,text) {
    const from = '+972524287681';
    const to = toPhonnum;
     await vonage.sms.send({to, from, text})
         .then(resp => { console.log('Message sent successfully'); console.log(resp); })
         .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
  }


  module.exports = sendSMS;