/**
 * Created by kathires on 8/8/16.
 */
var topicsDisplayLimit = 10,
    hostUrl = location.host.match(/(www.)?tekaptitude\.com/) ?  'https://tekaptitude.herokuapp.com' : 'http://localhost:3000',
    questions = null,
    MAX_LIMIT = 5;

function getCookieValue( name ){

    var cookieArr = document.cookie.split(';');
    for( var i = 0, len = cookieArr.length; i < len; i++ ){

        cookieArr[i] = cookieArr[i].replace(/^\s*/,'');
        if( cookieArr[i].split('=')[0] === name ){

            return cookieArr[i].split('=')[1];

        }

    }
    return null;

}

app.controller( "topicsController", function( $scope, $uibModal, $http, $location ){

    //hostUrl = decodeURIComponent(getCookieValue('hostUrl'));
    console.log('============hostUrl: ',hostUrl);


    $http.get( hostUrl+'/topics/topic' ).then( function( res ) {
        console.log(res.data);
        var topics = res.data,
            counter = 0;

        $scope.topics = {};
        $scope.topicsDisplayLimit = topicsDisplayLimit;

        for( var topic in topics ){
            $scope.topics[ topics[topic].topic] = topics[topic].title;

        }

    });


    $scope.openTopic = function( topicName, topicId ){
console.log('=========openTopic===',topicName);
        var modalInstance = $uibModal.open( {

            templateUrl: 'html/topicSelection.html',
            controller: 'topicSelectionController',
            backdrop: false,
            resolve:{
                topicInfo:function () {
                    return {
                        topicName: topicName,
                        topicId: topicId
                    }
                }
            }

        });
    };

} );

app.controller( "showResultController", function( $scope, $uibModalInstance, $http, modalService, resultInfo ) {

    var CORRECT_ANSWERS = "info",
        WRONG_ANSWERS = "danger",
        UNATTENDED_ANSWERS = "warning";

    $scope.topicName = resultInfo.topicName;
    $scope.resultInfo = resultInfo;


    $http.post( hostUrl+'/topics/answers', resultInfo ).then( function( res ) {

        console.log('=======ANSWER DATA====', res.data);
        var result = res.data,
            correctAnswers = result.correctAnswers,
            wrongAnswers = result.wrongAnswers,
            totalAnswers = result.totalAnswers,
            totalQuestions = result.totalQuestions;
        function getPercentage( val, totalVal ){
            return Math.round((val/totalVal)*100);
        }
        $scope.resultInfo = res.data;
        $scope.resultProgress = [
            {"value":getPercentage(correctAnswers,totalQuestions),type:CORRECT_ANSWERS},
            {"value":getPercentage(wrongAnswers,totalQuestions),type:WRONG_ANSWERS},
            {"value":getPercentage((totalQuestions-totalAnswers),totalQuestions),type:UNATTENDED_ANSWERS}
        ];

    });


    $scope.cancel = function(){

        $uibModalInstance.dismiss();

    };

});

app.controller( "topicTestController", function( $scope, $uibModalInstance, $uibModal, $interval, $http, modalService, topicInfo ){

    var secsRemaining = 1800;

    $scope.currentQuestion = 1;
    $scope.topicName = topicInfo.topicName;console.log('=============questions.length===',questions.length);
    $scope.totalQuestions = questions.length;
    $scope.maxLimit = MAX_LIMIT;
    $scope.answers = {};
    $scope.questionIndex = {};

    function setQuestion () {

        $scope.question = questions[$scope.currentQuestion-1].questions.question;
        $scope.choices = questions[$scope.currentQuestion-1].questions.choices;

    }

    setQuestion();

    $scope.answerSelected = function( index, answer ){

        $scope.answers[ index ] = answer;
        $scope.questionIndex[ parseInt(questions[index-1].questions.index) ] = answer;
        console.log('============Answers ',index-1,questions,questions[index-1].questions.index, $scope.answers, $scope.answers[ index ]);

    };

    $scope.questionChanged = function() {

        setQuestion();

    };

    $scope.ok = function(){

        $uibModalInstance.close();

    };

    $scope.cancel = function(){

        $uibModalInstance.dismiss();

    };

    $scope.confirmClose = function(){

        modalService.close();

    };

    $scope.confirmOk = function(){

        modalService.close();
        $uibModalInstance.dismiss();
        var resultInfo = {

            questions: questions,
            answers: $scope.answers,
            questionIndex : $scope.questionIndex,
            totalTime: 1800,
            timeTaken: 0,
            topicId: topicInfo.topicId,
            difficulty: topicInfo.difficulty

        };
        console.log('=======Answer obj:', resultInfo.answers);
        console.log('=======QuestionIndex obj:', resultInfo.questionIndex);
        var modalInstance = $uibModal.open( {

            templateUrl: 'html/showResult.html',
            controller: 'showResultController',
            backdrop: false,
            resolve:{
                resultInfo:function () {
                    return resultInfo;
                }
            }

        });

    };

    $scope.finishTest = function(){

        var questionsAnswered = Object.keys($scope.answers).length;
        if( questions.length > questionsAnswered ){

            $scope.confirmMessage = "You have still "+($scope.totalQuestions - questionsAnswered)+" questions unanswered. Are you sure you want to finish the test?";

           // alert('Not all questions are completed.');
            modalService.open($scope, 'html/confirmDialog.html', 'sm', 'confirmWindowClass');//'topicTestController',

        }else{



        }

    };

    $scope.timeLeft = "30:00";

    $interval(function () {

        var secs = secsRemaining%60;

        $scope.timeLeft = Math.floor(secsRemaining/60)+ ( secs < 10 ? ":0" : ":" ) + secs;
        secsRemaining--;

    }, 1000);


} );

app.controller( "topicSelectionController", function( $scope, $uibModalInstance, $uibModal, $interval, $http, topicInfo ){

    var difficulty = null;

    $scope.topicName = topicInfo.topicName;
    $scope.topicId = topicInfo.topicId;
    $scope.alerts = [];

    $scope.setDifficulty = function( val ){

        difficulty = val;

        $http.get( hostUrl+'/topics/'+encodeURIComponent($scope.topicId)+'/'+difficulty+'/30' ).then( function( res ) {
            console.log('======10',res.data,hostUrl+'/topics/'+encodeURIComponent($scope.topicId)+'/'+difficulty+'/30' );
            questions = res.data;
            $uibModalInstance.close();
            var modalInstance = $uibModal.open( {

                templateUrl: 'html/topic.html',
                controller: 'topicTestController',
                backdrop: false,
                animation: false,
                resolve:{
                    topicInfo:function () {
                        return {
                            topicName: topicInfo.topicName,
                            topicId:topicInfo.topicId,
                            difficulty:difficulty
                        };
                    }
                }

            });

        } );

    }


    $scope.ok = function(){

        $uibModalInstance.close();

    };

    $scope.cancel = function(){

        $uibModalInstance.dismiss();

    };

    $scope.closeAlert = function( index ){

        $scope.alerts.splice( index, 1);

    }

} );
