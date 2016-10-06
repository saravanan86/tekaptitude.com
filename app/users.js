var express = require('express'),
    router = express.Router(),
    db = require( './db' );

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


router.post( '/adduser',function( req, res ){

    var firsName = req.body.firstName,
        lastName = req.body.lastName,
        dob = req.body.dob,
        email = req.body.email,
        password = req.body.password,
        index = 0;
        //doc = {_id:getNextSequence("userid"),"firstname":firsName,"lastname":lastName,"email":email,"password":password,"dob":dob,"index":index};

    /*db.get().collection('users').insertOne( doc,function( err, docs ){

        //console.log('=============AFTER INSERT====', docs.insertedCount);
        res.json({"success":docs.insertedCount});

    } );*/

    db.get().collection('users').find({},{index:1,_id:0}).sort({index:-1}).limit(1).toArray(function( err, docs ){

        //console.log('=================Answer array===', docs);
        if( docs.length ){

            index = docs[0].index;

        }
//db.users.insert({"firstname":"Anand","lastname":"Kannaiah","email":"kanniah.anand@yahoo.com","password":"test1234",dob:""})
        var doc = {"index":index,"firstname":firsName,"lastname":lastName,"email":email,"password":password,"dob":dob};
        db.get().collection('users').insertOne( doc,function( err, docs ){

            console.log('=============AFTER INSERT====', docs);
            if( docs && docs.insertedCount ){

                res.json({"success":docs.insertedCount});

            }else{

                res.json({"success":0});

            }


        } );


    });

    /*db.get().collection('users').find({"email":emailRegExp,"password":password}).toArray(function(err, docs) {

        console.log('Answers array====', docs);

        if( docs.length > 0 ){

            res.json(docs[0])

        } else {

            res.json({});

        }

    });*/

    //res.send("DATA FOR POST. topicName:"+req.body.topicName);

});

module.exports = router;