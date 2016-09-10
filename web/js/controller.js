/**
 * Created by kathires on 8/8/16.
 */
var topicsDisplayLimit = 10,
    hostUrl = location.host === 'www.tekaptitude.com' ?  'https://tekaptitude.herokuapp.com' : 'http://localhost:3000';

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

    hostUrl = decodeURIComponent(getCookieValue('hostUrl'));
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
            controller: 'modalInstanceController',
            backdrop: false,
            resolve:{
                topicInfo:function () {
                    return topicName;
                }
            }

        });
    };

} );

app.controller( "topicController", function( $scope, $uibModalInstance ){



} );

app.controller( "modalInstanceController", function( $scope, $uibModalInstance, $uibModal, $interval, $http, topicInfo ){

    var secsRemaining = 1800,
        currentQuestion = 0,
        difficulty = null;

    //$scope.options = [ "Choice 1", "Choice 2", "Choice 3", "Choice 4"];
    console.log('======toicInfo====',topicInfo);

    $scope.topicName = topicInfo;
    $scope.alerts = [];
    $scope.isLast = false;
    $scope.isFirst = true;

    function setQuestion () {
        $scope.index = currentQuestion + 1;
        $scope.question = sampleQuestions[currentQuestion].question;
        $scope.choices = sampleQuestions[currentQuestion].choices;
    }

    setQuestion();

    $scope.prevQuestion = function(){

        currentQuestion--;
        $scope.isFirst = false;
        $scope.isLast = false;
        if( currentQuestion <= 0 ){
            //currentQuestion = sampleQuestions.length-1;
            $scope.isFirst = true;
        }
        setQuestion();

    };

    $scope.nextQuestion = function(){

        currentQuestion++;
        $scope.isFirst = false;
        $scope.isLast = false;
        if( currentQuestion >= sampleQuestions.length ){
            //currentQuestion = 0;
            $scope.isLast = true;
            return;
        }
        setQuestion();

    };

    $scope.next = function(){

        if( difficulty === null ){

            $scope.alerts.push({'msg':'Please select a difficulty level!!'});
            return;

        }
console.log('/tests/'+$scope.topicName+'/'+difficulty);

        hostUrl = decodeURIComponent(getCookieValue('hostUrl'));
        $http.get( hostUrl+'/topics/'+$scope.topicName+'/'+difficulty ).then( function( res ) {
            console.log('======10',res.data.questions,'/tests/'+$scope.topicName+'/'+difficulty);
            sampleQuestions = res.data.questions;
            $uibModalInstance.close();
            var modalInstance = $uibModal.open( {

                templateUrl: 'html/topic.html',
                controller: 'modalInstanceController',
                animation: false,
                resolve:{
                    topicInfo:function () {
                        return topicInfo;
                    }
                }

            });

        } );

    };

    $scope.setDifficulty = function( val ){

        difficulty = val;

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

    $scope.timeLeft = "30:00";

    $interval(function () {

        var secs = secsRemaining%60;

        $scope.timeLeft = Math.floor(secsRemaining/60)+ ( secs < 10 ? ":0" : ":" ) + secs;
        secsRemaining--;

    }, 1000);

} );
