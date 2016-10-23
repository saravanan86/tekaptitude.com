var express = require('express'),
    router = express.Router(),
    db = require( './db' ),
    mail = require( './mail' );

router.post( '/user',function( req, res ){

    var email = req.body.email,
        password = req.body.password,
        emailRegExp = new RegExp("^"+email+"$","i");

    db.get().collection('users').find({"email":emailRegExp,"password":password}).toArray(function(err, docs) {

        console.log('Answers array====', docs);

        if( docs.length > 0 ){

            res.json(docs[0])

        } else {

            res.json({});

        }

    });

    //res.send("DATA FOR POST. topicName:"+req.body.topicName);

});

router.post( '/forgot',function( req, res ){

    var email = req.body.email
        emailRegExp = new RegExp("^"+email+"$","i"),
        userInfo = null;

    db.get().collection('users').find({"email":emailRegExp}).toArray(function(err, docs) {

        console.log('Answers array====', docs);

        if( docs.length > 0 ){

            userInfo = docs[0];

            mail.forgotMail( {
                firstName : userInfo.firstname,
                lastName : userInfo.lastname,
                email : userInfo.email,
                password: userInfo.password
            },function(error, response){} );

            res.json({"success":true});

        } else {

            res.json({"success":false});

        }

    });

    //res.send("DATA FOR POST. topicName:"+req.body.topicName);

});


router.post( '/adduser',function( req, res ){

    var firsName = req.body.firstName,
        lastName = req.body.lastName,
        dob = req.body.dob,
        email = req.body.email,
        password = req.body.password,
        index = 0;

    db.get().collection('users').find({},{index:1,_id:0}).sort({index:-1}).limit(1).toArray(function( err, docs ){

        if( docs.length ){

            index = docs[0].index;

        }

        var doc = {"index":index+1,"firstname":firsName,"lastname":lastName,"email":email,"password":password,"dob":dob};
        db.get().collection('users').insertOne( doc,function( err, docs ){

            console.log('=============AFTER INSERT====', docs);
            if( docs && docs.insertedCount ){

                mail.signupMail( {
                    firstName : firsName,
                    lastName : lastName,
                    email : email
                },function(error, response){} );

                res.json({"success":docs.insertedCount});

            }else{

                res.json({"success":0});

            }


        } );


    });

});

module.exports = router;