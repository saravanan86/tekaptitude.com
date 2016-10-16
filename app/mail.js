var express = require('express'),
    router = express.Router(),
    nodemailer = require('nodemailer'),
    transporter = null,
    mailTemplate = {
        from: '"Support Tekaptitude" <support@tekaptitude.com>', // sender address
        to: '%toEmail', // tekaptitude@gmail.com
        subject: '%subject', // Subject line
        text: '%message', // plaintext body
    };

exports.setMailSettings = function( config ){
    
    transporter = nodemailer.createTransport('smtps://'+config.mail.user+':'+config.mail.password+'@'+config.mail.server);

};

exports.signupMail = function( to, done ){

    if( transporter && to ){

        signupMail = mailTemplate;
        signupMail.to = mailTemplate.to.replace(/%toEmail/,to.email);
        signupMail.subject = mailTemplate.subject.replace(/%subject/,'Congrats %firstName %lastName!! Signed up successfully'.replace(/%firstName/,to.firstName).replace(/%lastName/,to.lastName));
        signupMail.text = mailTemplate.text.replace(/%message/,'Hi %firstName %lastName, \n\t\tThank you for signing up with Tekaptitude.com.\nYours truly,\nTekaptitude Team'.replace(/%firstName/,to.firstName).replace(/%lastName/,to.lastName));

        transporter.sendMail( signupMail, function( error, info ) {

            if(error){

                done( error, {success:false} );
                //return console.log(error);

            }
            console.log('=======DONE 2=======',to, done);
            done( error, {success:true} );
        });

    }

};
