const nodemailer = require('nodemailer');

function sendVerificationCode(receiver, verificationCode) {
    
    const sender = 'webis1996@gmail.com';
    const subject = 'Reset Webis Password';
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'webis1996@gmail.com',
            pass: 'Webis@1996#1995'
        }
    });

    const mailOptions = {
        from: sender,
        to: receiver,
        subject: subject,
        
         html: '<h1>Welcome to Webis Password Reset, </h1><p>Your verification code for reset password is </p>' + verificationCode
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('error');
            console.log(error);
            throw new Error('email sending failed');
            
        } else {
            console.log("Email Sent Sucessful");
            res.status(200).json({
                state: true
            })
        }
    });
}

function sendNewPassword(receiver, newpassword) {
    const sender = 'webis1996@gmail.com';
    const subject = 'Reset ClzMate Password';
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        
        
        auth: {
            user: 'webis1996@gmail.com',
            pass: 'Webis@1996#1995'
        },
       
    });

    const mailOptions = {
        from: sender,
        to: receiver,
        subject: subject,
        html: '<h1>Welcome to Webis, </h1><p>Your new password is </p>' + newpassword
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('error');
            console.log(error);
            throw new Error('email sending failed');
            
        } else {
            console.log('New password sent Suessfully in Email');
            res.status(200).json({
                state: true
                
            })
        }
    });
}

module.exports = {
    sendVerificationCode: sendVerificationCode,
    sendNewPassword: sendNewPassword
};