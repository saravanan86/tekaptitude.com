var express = require('express'),
    router = express.Router(),
    db = require( './db' );

router.get('/:topic/:difficulty/:size', function (req, res) {

    var topic = ( req.params.topic ? req.params.topic : 'java' ).toLowerCase(),
        size = ( req.params.size && !isNaN( req.params.size ) ? parseInt( req.params.size ) : 30 ),
        difficulty = ( req.params.difficulty && !isNaN( req.params.difficulty ) ? parseInt( req.params.difficulty ) : 1 ),
        randomArr = [];

    db.get().collection( 'questionbank' ).find( {'topic':topic}, {'questions.index':1,'_id':0} ).toArray( function( err, docs ){

        console.log('======RANDOM==',docs);
        randomArr = getRandomQuestionIndex( docs,size );
        console.log('====size 1====',size,randomArr);
        //db.questionbank.aggregate([{$match:{'index':0}},{$unwind:'$questions'},{$match:{'questions.index':{$in:[45,46]}}}]).pretty()
        //db.questionbank.aggregate([{$match:{'index':0}},{$unwind:'$questions'},{$match:{'questions.index':{$in:[45,46]}}},{$project:{'_id':0,'index':1,'topic':1,'title':1,'level':1,'questions.question':1,'questions.choices':1,'questions.index':1}}])
        //db.get().collection('questionbank').find({'topic':topic,'level':difficulty},{'questions.answer':0}).toArray(function(err, docs) {
        db.get().collection('questionbank').aggregate([{$match:{'topic':topic}},{$unwind:'$questions'},{$match:{'questions.index':{$in:randomArr}}},{$project:{'_id':0,'questions.question':1,'questions.choices':1,'questions.index':1}}]).toArray(function(err, docs) {

            console.log('Questions array====',docs);
            res.json(docs);
        });

    });

});

router.get( '/topic', function( req, res ){

    db.get().collection('questionbank').find( {}, {'topic':1,'title':1,'_id':0} ).toArray( function( err, docs ){

        //console.log('====TOPICS===',docs);
        res.send( docs );

    } );

} );


router.get( '/:topic/:size', function( req, res ){

    var topic = ( req.params.topic ? req.params.topic : 'java' ),
        size = ( req.params.size && !isNaN( req.params.size ) ? parseInt( req.params.size ) : 30 );

    db.get().collection( 'questionbank' ).find( {'topic':topic}, {'questions.index':1,'_id':0} ).toArray( function( err, docs ){

        //console.log('======RANDOM==',docs);
        //console.log('====size====',size);
        res.send( getRandomQuestionIndex( docs,size ) );

    });

});

router.post( '/answers',function( req, res ){

    var topicId = req.body.topicId,
        difficulty = req.body.difficulty,
        questions = req.body.questions,
        answers = req.body.answers,
        questionIndexes = Object.keys( req.body.questionIndex ).map( Number ),
        questionResponse = req.body.questionIndex,
        correctAnswers = 0,
        wrongAnswers = 0;
    console.log('=======Answers Index======',questionIndexes, topicId,questionResponse);
    db.get().collection('questionbank').aggregate([{$match:{'topic':topicId}},{$unwind:'$questions'},{$match:{'questions.index':{$in:questionIndexes}}},{$project:{'_id':0,'questions.index':1,'questions.answer':1}}]).toArray(function(err, docs) {

        //console.log('Answers array====', docs);
        for( var i = 0, len = docs.length; i < len; i++ ){

            //for( var j = 0, length = questionResponse.length; j < length; j++ ){
            for( var j in questionResponse ) {

                if( docs[i].questions.index == j ){

                    if( docs[i].questions.answer ==  questionResponse[j]){
                        correctAnswers++;
                    }else {
                        wrongAnswers++;
                    }
                    break;

                }

            }

        }
        console.log('============questionIndexes: ',correctAnswers, wrongAnswers,questionIndexes.length, questions.length);
        res.json({correctAnswers:correctAnswers,wrongAnswers:wrongAnswers,totalAnswers:(correctAnswers+wrongAnswers),totalQuestions:questions.length});
    });

    //res.send("DATA FOR POST. topicName:"+req.body.topicName);

});

function getRandomQuestionIndex( questions, size ){

    var questionsArr = [],
        len = 0,
        random = 0,
        flag = false;

    if( questions.length > 0 ){

        len = questions[0].questions.length;
        size = ( size > len ? len : size );
        for( var i = 0; i < size; i++ ){
            flag = false;
            do {
                random = Math.floor(Math.random() * len);
                if( questionsArr.indexOf( random ) === -1 ){
                    questionsArr[i] = random;
                    flag = true;
                }
            }while( !flag )
            questionsArr[i] = random;

        }

    }

    return questionsArr;

}


module.exports = router;