var nodemailer = require('nodemailer');


function EmailSender(toE, subjectE, textE){

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'hmody.chechareto@gmail.com',
        pass: 'jnogmosdhegheqnn'
        }
    });
  
    var mailOptions = {
        from: 'hmody.chechareto@gmail.com',
        to: toE,
        subject: subjectE,
        text: textE  
    };

  
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    });
}
module.exports = EmailSender;
