/**
 * Created by kathires on 8/8/16.
 */
var topicsDisplayLimit = 10,
    hostUrl = location.host.match(/(www.)?tekaptitude\.com/) ?  'https://tekaptitude.herokuapp.com' : 'http://localhost:3000',
    questions = null,
    MAX_LIMIT = 5,
    PASS_PERCENT=70,
    SUCCESS_MSG="Success. You scored %d%",
    FAIL_MSG="Fail. You scored %d%",
    TOTAL_TIME=1800;

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

app.controller( "loginPageController", function( $scope, $uibModalInstance, $http, $rootScope, loginService ){

    $scope.alerts = [];

    //$scope.login = {email:"test"};
    //{"msg":"You have only 30 secs remaining.\nYou have only 30 secs remaining."}

    $scope.closeAlert = function(){

        $scope.alerts = [];

    };

    $scope.cancel = function(){

        $uibModalInstance.dismiss();

    };

    $scope.submitPage = function( loginForm ){

        var email = ( loginForm ? loginForm.email : "" ),
            password = ( loginForm ? loginForm.password : "" ),
            errMsg = "";

        if( email === "" ){

            errMsg = "Email address is required. Please enter a valid email address.\n";
            //$scope.alerts = [{"msg":"You have only 30 secs remaining.\nYou have only 30 secs remaining."+loginForm.email}];
        } else if( !email.match(/[^\s]*[a-zA-Z0-9]@[^\s]*[a-zA-Z0-9]\.[a-zA-Z0-9][^\s]*/) ){

            errMsg = "Please enter a valid email address.\n";

        }
        if( password === "" ){

            errMsg += "Password is required. Please enter a password.";

        }
        if( errMsg != "" ){

            $scope.alerts = [{"msg": errMsg}];
            return;

        }

        var userInfo = {

            email:email,
            password:password

        };

        $http.post( hostUrl+'/users/user', userInfo ).then( function( res ) {

            console.log('=======ANSWER DATA ====', res.data);
            if( res.data.email ){

                $uibModalInstance.dismiss();
                loginService.setUserInfo( res.data );
                $rootScope.$emit("logged-in",res.data);

            }else{
                $scope.alerts = [{"msg": "Username/password entered is incorrect. Please try again."}];
                return;
            }

        });

        /*else if( password.match(/[\s]/) || (password.length > 7 && password.length < 17) ){

            errMsg = "Please enter a valid email address.";
            //Password should be min 8 and max 16 characters in length and no spaces allowed.
            

        }*/
        //console.log('==============loginForm: ', loginForm);
        //$scope.alerts = [{"msg":"You have only 30 secs remaining.\nYou have only 30 secs remaining."+loginForm.email}];

    }

} );

app.controller( "navController", function( $scope, $rootScope ){

    $scope.isLoggedIn = false;
    $rootScope.$on("logged-in",function( event, userInfo ){
        
        $scope.isLoggedIn = true;
        
    });
    
} )

app.controller( "loginController", function( $scope, $uibModal, $rootScope, loginService ){

    $scope.isLoggedIn = false;
    $scope.userInfo = {};
    $scope.openLogin = function(){

        var modalInstance = $uibModal.open( {

            templateUrl: 'html/login.html',
            controller: 'loginPageController',
            size: 'sm',
            backdrop: false

        });

    };

    //console.log('===============SERVICE UPDATED====', loginService.getUserInfo());
    $rootScope.$on("logged-in",function( event, userInfo ){

        $scope.isLoggedIn = true;
        $scope.userInfo = userInfo;
        console.log('===============SERVICE UPDATED====', loginService.getUserInfo());
        console.log('============LOGGED IN EVENT: ',event, userInfo);

    });

} );

app.controller( "showResultController", function( $scope, $uibModalInstance, $http, $interval, modalService, resultInfo ) {

    var CORRECT_ANSWERS = "info",
        WRONG_ANSWERS = "danger",
        UNATTENDED_ANSWERS = "warning";

    $scope.topicName = resultInfo.topicName;
    $scope.isResultReady = false;
    $scope.status={ open:false };


    $http.post( hostUrl+'/topics/answers', resultInfo ).then( function( res ) {

        //console.log('=======ANSWER DATA====', res.data);
        res.data.timeTaken = resultInfo.timeTaken;
        $scope.result = res.data;
        var result = res.data,
            correctAnswers = result.correctAnswers,
            wrongAnswers = result.wrongAnswers,
            totalAnswers = result.totalAnswers,
            totalQuestions = result.totalQuestions,
            totalUnattendedQuestions = (totalQuestions-totalAnswers);
        function getPercentage( val, totalVal ){
            return Math.round((val/totalVal)*100);
        }
        $scope.resultInfo = res.data;
        var correctBar = 0,
            wrongBar = 0,
            totalBar = 0;
        var delay = $interval(function(){

            if( correctAnswers == 0 && wrongAnswers == 0 && totalUnattendedQuestions ==0 ){
                //console.log('=====================SHOWING RESULT NOW========');
                //clearTimeout(delay);
                $interval.cancel( delay );
                var resultPercent = getPercentage(correctBar,totalQuestions);
                $scope.testResult = (resultPercent >= 70 ? SUCCESS_MSG.replace(/%d/,resultPercent) : FAIL_MSG.replace(/%d/,resultPercent) );
                $scope.isResultReady = true;
            }

            $scope.resultProgress = [
                {"value":getPercentage(correctBar,totalQuestions),type:CORRECT_ANSWERS},
                {"value":getPercentage(wrongBar,totalQuestions),type:WRONG_ANSWERS},
                {"value":getPercentage(totalBar,totalQuestions),type:UNATTENDED_ANSWERS}
            ];
            //console.log('=======resultProgress==',$scope.resultProgress,correctAnswers,wrongAnswers,totalUnattendedQuestions);
            if( correctAnswers > 0 ){
                correctBar++;
                correctAnswers--;
            }
            if( wrongAnswers > 0 ){
                wrongBar++;
                wrongAnswers--
            }
            if( totalUnattendedQuestions > 0 ){
                totalBar++;
                totalUnattendedQuestions--;
            }



        },150);


    });


    $scope.cancel = function(){

        $uibModalInstance.dismiss();

    };

});

app.controller( "topicTestController", function( $scope, $uibModalInstance, $uibModal, $interval, $http, modalService, topicInfo ){

    var secsRemaining = TOTAL_TIME,
        flag = false,
        finishFlag = false,
        testInterval = null;

    $scope.currentQuestion = 1;
    $scope.topicName = topicInfo.topicName;
    $scope.totalQuestions = questions.length;
    $scope.maxLimit = MAX_LIMIT;
    $scope.answers = {};
    $scope.questionIndex = {};
    $scope.alerts = [];
    $scope.isConfirmBox = true;
    $scope.isAlertBox = false;

    function setQuestion () {

        $scope.question = questions[$scope.currentQuestion-1].questions.question;
        $scope.choices = questions[$scope.currentQuestion-1].questions.choices;

    }

    setQuestion();

    $scope.answerSelected = function( index, answer ){

        $scope.answers[ index ] = answer;
        $scope.questionIndex[ parseInt(questions[index-1].questions.index) ] = answer;

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
        showResultPage();

    };

    $scope.finishTest = function(timeOver){

        var questionsAnswered = Object.keys($scope.answers).length;
        if( timeOver ){

            $scope.isAlertBox = true;
            $scope.isConfirmBox = false;
            $scope.confirmMessage = "Your test time is up, going to result page now.";

            // alert('Not all questions are completed.');
            modalService.open($scope, 'html/confirmDialog.html', 'sm', 'confirmWindowClass');//'topicTestController',


        }else if( questions.length > questionsAnswered ){

            $scope.isAlertBox = false;
            $scope.isConfirmBox = true;
            $scope.confirmMessage = "You have still "+($scope.totalQuestions - questionsAnswered)+" questions unanswered. Are you sure you want to finish the test?";

           // alert('Not all questions are completed.');
            modalService.open($scope, 'html/confirmDialog.html', 'sm', 'confirmWindowClass');//'topicTestController',

        }else{

            showResultPage();

        }

    };

    $scope.closeAlert = function( index ){

        $scope.alerts.splice( index, 1);

    }

    $scope.timeLeft = "30:00";

    testInterval = $interval(function () {

        var secs = secsRemaining%60;

        if( secsRemaining <= 30 && flag === false ){
            $scope.alerts = [{"msg":"You have only 30 secs remaining."}];
            flag = true;
        }

        if( secsRemaining <= 0 && finishFlag === false ){

            $scope.finishTest( true );
            finishFlag = true;
            testInterval = null;
            
        }

        //$scope.timeLeft = Math.floor(secsRemaining/60)+ ( secs < 10 ? ":0" : ":" ) + secs;
        $scope.timeLeft = secsFormatter( secsRemaining );
        secsRemaining--;

    }, 1000);

    function showResultPage() {

        $interval.cancel( testInterval );
        $uibModalInstance.dismiss();
        //console.log('==========TIME TAKEN FOR RESULT PAGE======',secsRemaining,secsFormatter( TOTAL_TIME - secsRemaining ));
        var resultInfo = {

            questions: questions,
            answers: $scope.answers,
            questionIndex : $scope.questionIndex,
            totalTime: 1800,
            timeTaken: secsFormatter( TOTAL_TIME - secsRemaining ),
            topicId: topicInfo.topicId,
            topicName: topicInfo.topicName,
            difficulty: topicInfo.difficulty

        };

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

    }

    function secsFormatter( secs ){
        //console.log('===========secsFormatter===',secs,(Math.floor(secs/60)+ ( (secs%60) < 10 ? ":0" : ":" ) + (secs%60)));
        return (Math.floor(secs/60)+ ( (secs%60) < 10 ? ":0" : ":" ) + (secs%60));

    }


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



} );
