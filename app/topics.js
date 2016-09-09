var express = require('express'),
    router = express.Router(),
    db = require( './db' );

router.get('/:type/:difficulty', function (req, res) {

    db.get().collection('questionbank').find({'topic':req.params.type.toLowerCase(),'level':parseInt(req.params.difficulty)},{'questions.answer':0}).toArray(function(err, docs) {

        console.log(docs);
        res.json(docs[0]);
    });


});

router.get( '/topic', function( req, res ){

    db.get().collection('questionbank').find( {}, {'topic':1,'title':1,'_id':0} ).toArray( function( err, docs ){

        console.log('====TOPICS===',docs);
        res.send( docs );

    } );

} );


module.exports = router;