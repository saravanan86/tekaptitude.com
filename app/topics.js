var express = require('express'),
    router = express.Router(),
    db = require( './db' );

router.get('/:topic/:difficulty/:size', function (req, res) {

    var topic = ( req.params.topic ? req.params.topic : 'java' ).toLowerCase(),
        size = ( req.params.size && !isNaN( req.params.size ) ? parseInt( req.params.size ) : 30 ),
        difficulty = ( req.params.difficulty && !isNaN( req.params.difficulty ) ? parseInt( req.params.difficulty ) : 1 ),
        randomArr = [];

    db.get().collection( 'questionbank' ).find( {'topic':topic}, {'questions.index':1,'_id':0} ).toArray( function( err, docs ){

        randomArr = getRandomQuestionIndex( docs,size );
        //db.questionbank.aggregate([{$match:{'index':0}},{$unwind:'$questions'},{$match:{'questions.index':{$in:[45,46]}}}]).pretty()
        //db.questionbank.aggregate([{$match:{'index':0}},{$unwind:'$questions'},{$match:{'questions.index':{$in:[45,46]}}},{$project:{'_id':0,'index':1,'topic':1,'title':1,'level':1,'questions.question':1,'questions.choices':1,'questions.index':1}}])
        //db.get().collection('questionbank').find({'topic':topic,'level':difficulty},{'questions.answer':0}).toArray(function(err, docs) {
        db.get().collection('questionbank').aggregate([{$match:{'topic':topic}},{$unwind:'$questions'},{$match:{'questions.index':{$in:randomArr}}},{$project:{'_id':0,'questions.question':1,'questions.choices':1,'questions.index':1,'questions.answer':1}}]).toArray(function(err, docs) {

            //console.log('Questions array 1====',docs);
            docs = checkMultiAnswerOptions(docs);
            //console.log('Questions array 2====',docs);
            res.json(docs);
        });

    });

});

router.get( '/topic', function( req, res ){

    db.get().collection('questionbank').find( {}, {'topic':1,'title':1,'_id':0,'index':1} ).toArray( function( err, docs ){

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

router.post( '/getQuestions', function( req, res ){

    var index = ( req.body.topicIndex ? req.body.topicIndex : 0 );

    db.get().collection('questionbank').find( {'index':index}, {'topic':1,'title':1,'_id':0,'index':1,'questions':1} ).toArray( function( err, docs ){

        res.send( docs.length > 0 ? docs[0].questions : null );

    } );

} );

router.post( '/updateQuestions', function( req, res ){

    var question = req.body.question,
        choices = req.body.choices,
        answer = req.body.answer,
        index = req.body.index,
        topicIndex = req.body.topicIndex;

    answer = ( !isNaN( answer ) || Array.isArray( answer ) ? answer : answer.replace(/[\s]*,[\s]*/g,',').replace(/^,|,$/g,'').split(',') );
    choices = ( Array.isArray( choices ) ? choices : choices ? choices.replace(/[\s]*,[\s]*/g,',').replace(/^,|,$/g,'').split(',') : [] );

    db.get().collection( 'questionbank' ).find( {'index':topicIndex,'questions.index':index} ).toArray( function( err, docs ){

        if( docs && docs.length > 0 ){

            db.get().collection('questionbank').updateOne( {'index':topicIndex,'questions.index':index}, {$set:{'questions.$.choices':choices,'questions.$.answer':answer,'questions.$.question':question}}, function( err, docs ){


                if( docs && docs.modifiedCount ){

                    res.json({"success":docs.modifiedCount});

                }else{

                    res.json({"success":0});

                }

            } );

        }else{

            db.get().collection('questionbank').updateOne( {'index':topicIndex}, {$push:{'questions':{'question':question,'choices':choices,'answer':answer,'index':index}}}, function( err, docs ){


                if( docs && docs.modifiedCount ){

                    res.json({"success":docs.modifiedCount});

                }else{

                    res.json({"success":0});

                }

            } );

        }

    } );

} );

router.post( '/answers',function( req, res ){

    var topicId = req.body.topicId,
        difficulty = req.body.difficulty,
        questions = req.body.questions,
        answers = req.body.answers,
        questionIndexes = Object.keys( req.body.questionIndex ).map( Number ),
        questionResponse = req.body.questionIndex,
        correctAnswers = 0,
        wrongAnswers = 0;

    db.get().collection('questionbank').aggregate([{$match:{'topic':topicId}},{$unwind:'$questions'},{$match:{'questions.index':{$in:questionIndexes}}},{$project:{'_id':0,'questions.index':1,'questions.answer':1}}]).toArray(function(err, docs) {

        //console.log('Answers array====', docs);
        for( var i = 0, len = docs.length; i < len; i++ ){

            //for( var j = 0, length = questionResponse.length; j < length; j++ ){
            for( var j in questionResponse ) {

                if( docs[i].questions.index == j ){

                    //if( docs[i].questions.answer ==  questionResponse[j]){
                    if( checkAnswers( questionResponse[j], docs[i].questions.answer ) ){
                        correctAnswers++;
                    }else {
                        wrongAnswers++;
                    }
                    break;

                }

            }

        }

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

function checkAnswers( selectedAnswer, correctAnswer ){

    if( Array.isArray( correctAnswer ) ){

        for( var i = 0, len = correctAnswer.length; i < len; i++){

            if( !selectedAnswer.find(function(item){ return item == correctAnswer[i] }) ){
                return false;
            }

        }
        return true;

    } else {

        return selectedAnswer === correctAnswer;

    }
    return false;
}

function checkMultiAnswerOptions( docs ){

    var resultDoc = [];
    for( var i = 0, len = docs.length; i < len; i++ ){

        resultDoc[i] = docs[i];
        resultDoc[i].questions.isMulti = ( Array.isArray( docs[i].questions.answer )  ? true : false );
        resultDoc[i].questions.answer = "";

    }
    return resultDoc;

}

module.exports = router;