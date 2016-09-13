/**
 * Created by kathires on 8/8/16.
 */
var topicsDisplayLimit = 10,
    hostUrl = location.host === 'www.tekaptitude.com' ?  'https://tekaptitude.herokuapp.com' : 'http://localhost:3000',
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
        //console.log(res);
        var topics = res.data,
            counter = 0;

        $scope.topics = {};
        $scope.topicsDisplayLimit = topicsDisplayLimit;

        for( var topic in topics ){
            $scope.topics[ topics[topic].topic] = topics[topic].title;

        }

    });


    $scope.openTopic = function( topicName ){

        var modalInstance = $uibModal.open( {

            templateUrl: 'html/topicSelection.html',
            controller: 'topicSelectionController',
            backdrop: false,
            resolve:{
                topicInfo:function () {
                    return topicName;
                }
            }

        });
    };

} );

app.controller( "topicTestController", function( $scope, $uibModalInstance, $uibModal, $interval, $http, modalService, topicInfo ){

    var secsRemaining = 1800;

    $scope.currentQuestion = 1;
    $scope.topicName = topicInfo;console.log('=============questions.length===',questions.length);
    $scope.totalQuestions = questions.length;
    $scope.maxLimit = MAX_LIMIT;
    $scope.answers = {};

    function setQuestion () {

        $scope.question = questions[$scope.currentQuestion-1].question;
        $scope.choices = questions[$scope.currentQuestion-1].choices;

    }

    setQuestion();

    $scope.answerSelected = function( questionIndex, answer ){

        $scope.answers[ questionIndex ] = answer;
        console.log('============Answers ',$scope.answers, $scope.answers[ questionIndex ]);

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

        //modalService.close();

    };

    $scope.finishTest = function(){

        var questionsAnswered = Object.keys($scope.answers).length;
        if( questions.length > questionsAnswered ){
console.log('========Total Questions: ',$scope.totalQuestions,questionsAnswered,($scope.totalQuestions - questionsAnswered));
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

    $scope.topicName = topicInfo;
    $scope.alerts = [];

    $scope.setDifficulty = function( val ){

        difficulty = val;

        $http.get( hostUrl+'/topics/'+$scope.topicName+'/'+difficulty ).then( function( res ) {
            console.log('======10',res.data.questions,'/tests/'+$scope.topicName+'/'+difficulty);
            questions = res.data.questions;
            $uibModalInstance.close();
            var modalInstance = $uibModal.open( {

                templateUrl: 'html/topic.html',
                controller: 'topicTestController',
                backdrop: false,
                animation: false,
                resolve:{
                    topicInfo:function () {
                        return topicInfo;
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
