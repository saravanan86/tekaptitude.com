var express = require('express'),
    router = express.Router(),
    db = require( './db' );

/*router.get( '/getTopics', function( req, res ){

    db.get().collection('questionbank').find( {}, {'topic':1,'title':1,'_id':0,'index':1,'questions':0} ).toArray( function( err, docs ){

        //console.log('====TOPICS===',docs);
        res.send( docs );

    } );

} );*/


module.exports = router;