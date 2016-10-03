var express = require('express'),
    router = express.Router(),
    db = require( './db' );

router.post( '/user',function( req, res ){

    var email = req.body.email,
        password = req.body.password,
        emailRegExp = new RegExp("^"+email+"$","i");

console.log('=============input data===', email, password, {"email":"/^"+email+"$/i","password":password});
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

module.exports = router;