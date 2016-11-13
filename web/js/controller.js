/**
 * Created by kathires on 8/8/16.
 */
var topicsDisplayLimit = 8,
    hostUrl = location.host.match(/(www.)?tekaptitude\.com/) ?  'https://tekaptitude.herokuapp.com' : 'http://localhost:3000',
    questions = null,
    MAX_LIMIT = 5,
    PASS_PERCENT=70,
    SUCCESS_MSG="Success. You scored %d%",
    FAIL_MSG="Fail. You scored %d%",
    TOTAL_TIME=1800,
    requiredFields = [],
    topicsList = null;

function isValidDate( dateString )
{
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/"),
        day = parseInt(parts[1], 10),
        month = parseInt(parts[0], 10),
        year = parseInt(parts[2], 10),
        monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

function setMissedField( elemModelName ){

    var element = angular.element('[ng-model="'+elemModelName+'"]');
    element[0].className += " signUpMissedField";
    requiredFields.push(element[0]);
    console.log('======setMissedField====',requiredFields);
}

function resetMissedField(){

    for( var i = 0, len = requiredFields.length; i < len; i++ ){

        requiredFields[i].className = requiredFields[i].className.replace(/ signUpMissedField/,"");

    }
    requiredFields = [];
}

function getTopics( http, scope){

    http.get( hostUrl+'/topics/topic' ).then( function( res ) {
        console.log(res.data);
        var topics = res.data,
            counter = 0;

        scope.topics = {};
        scope.topicsDisplayLimit = topicsDisplayLimit;
        scope.topicsList = [];

        for( var topic in topics ){

            scope.topics[ topics[topic].topic] = topics[topic].title;
            scope.topicsList[ scope.topicsList.length+1 ] = { "title" : topics[topic].title, "name" : topics[topic].topic };

        }
        topicsList = scope.topicsList;
        console.log('======TOPICSLIST=====', topicsList);
        scope.isLoading = false;

    });

}

function openTopic( modalInstance, topicName, topicId ){

    var modalInstance = modalInstance.open( {

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
    return modalInstance;
}

app.controller( "topicsController", function( $scope, $uibModal, $http, $location ){

    //hostUrl = decodeURIComponent(getCookieValue('hostUrl'));
    //console.log('============hostUrl: ',hostUrl);
    $scope.isLoading = true;
    $scope.hasMore = true;

    if( topicsList ){

        $scope.isLoading = false;

    }else {

        getTopics( $http, $scope );

    }

    $scope.loadMore = function(){

        var len = Object.keys( $scope.topics ).length;

        if( len > $scope.topicsDisplayLimit ){

            $scope.topicsDisplayLimit += topicsDisplayLimit;

        }

        $scope.hasMore = (len > $scope.topicsDisplayLimit);

    };

    $scope.openTopic = function( topicName, topicId ){

        openTopic( $uibModal, topicName, topicId );

    };

    /*$scope.openTopic = function( topicName, topicId ){

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
    };*/

} );

app.controller( "loginPageController", function( $scope, $uibModalInstance, $http, $rootScope, loginService, modalService ){

    $scope.alerts = [];
    $scope.isForgotPassword = false;

    //$scope.login = {email:"test"};
    //{"msg":"You have only 30 secs remaining.\nYou have only 30 secs remaining."}

    $scope.closeAlert = function(){

        $scope.alerts = [];

    };

    $scope.cancel = function(){

        $uibModalInstance.dismiss();

    };

    $scope.forgotPassword = function(loginForm){

        $scope.alerts = [];
        $scope.isForgotPassword = true;
        $scope.isConfirmBox = false;
        $scope.isAlertBox = true;

        $scope.confirmOk = function(){

            modalService.close();
            $uibModalInstance.dismiss();

        };

        if( !loginForm ){
            return;
        }

        var email = ( loginForm && loginForm.email ? loginForm.email : "" ),
            errMsg = "";

        if( email === "" ){

            errMsg = "Email address is required. Please enter a valid email address.\n";
            //$scope.alerts = [{"msg":"You have only 30 secs remaining.\nYou have only 30 secs remaining."+loginForm.email}];
        } else if( !email.match(/[^\s]*[a-zA-Z0-9]@[^\s]*[a-zA-Z0-9]\.[a-zA-Z0-9][^\s]*/) ){

            errMsg = "Please enter a valid email address.\n";

        }
        if( errMsg != "" ){

            $scope.alerts = [{"msg": errMsg}];
            return;

        }

        var userInfo = {

            email:email

        };

        $http.post( hostUrl+'/users/forgot', userInfo ).then( function( res ) {

            console.log('=======ANSWER DATA ====', res.data);
            if( res.data.success == true ){

                //$uibModalInstance.dismiss();
                $scope.confirmMessage = "Success!! Your password is emailed to '"+userInfo.email+"'. Click 'Ok' to continue.";
                modalService.open($scope, 'html/confirmDialog.html', 'sm', 'confirmWindowClass');
                return;

            }else{
                $scope.alerts = [{"msg": "Email entered is not a valid one. Please provide a valid email address."}];
                return;
            }

        });


    };

    $scope.submitPage = function( loginForm ){

        $scope.alerts = [];
        var email = ( loginForm && loginForm.email ? loginForm.email : "" ),
            password = ( loginForm && loginForm.password ? loginForm.password : "" ),
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

app.controller( "navController", function( $scope, $rootScope, $http, loginService, $uibModal ){

    $scope.isLoggedIn = loginService.isLoggedIn();
    $scope.selected = undefined;

    if( !topicsList ){

        getTopics( $http, $scope );

    }

    $scope.searchSelected = function( topic ){

        console.log('============TOPICS SELECTED: ====', topic);

        openTopic( $uibModal, topic.title, topic.name );

    };

    //$scope.topicList =['java','actionScript','android'];
        //[{"actionScript":"ActionScript"},{"android":"Android"},{"angularjs":"AngularJs"},{"c":"C"},{"c#":"C#"}];
    $rootScope.$on("logged-in",function( event, userInfo ){
        
        $scope.isLoggedIn = true;
        
    });
    $rootScope.$on("logged-out",function( event, userInfo ){

        $scope.isLoggedIn = false;

    });
} );

app.controller( "signUpPageController", function( $scope, $uibModalInstance, $http, $rootScope, loginService, modalService ){

    $scope.alerts = [];
    $scope.isConfirmBox = false;
    $scope.isAlertBox = true;

    $scope.closeAlert=function () {

        $scope.alerts = [];
    };

    $scope.cancel = function(){

        $uibModalInstance.dismiss();

    };

    $scope.confirmOk = function(){

        modalService.close();
        $uibModalInstance.dismiss();

    };

    $scope.submitPage = function( user ){

        console.log('===============USER SIGN UP=====',user);
        var errMsg = "",
            user = user || {};
        $scope.user = user;
        $scope.alerts = [];

        resetMissedField();

        if( !user.firstName || user.firstName.replace(/[\s]/g,'') === "" ){

            errMsg += "Please enter a First name.\n";
            setMissedField( "user.firstName" );

        }
        if( !user.lastName || user.lastName.replace(/[\s]/g,'') === "" ){

            errMsg += "Please enter a Last name.\n";
            setMissedField( "user.lastName" );

        }
        if( ( user.dob && user.dob != "") && !isValidDate( user.dob ) ){

            errMsg += "Please enter date in format mm/dd/yyyy format.\n";
            setMissedField( "user.dob" );

        }
        if( !user.email || user.email.replace(/[\s]/g,'') === "" ){

            errMsg += "Please enter an Email.\n";
            setMissedField( "user.email" );

        }else if( !user.email.match(/[^\s]*[a-zA-Z0-9]@[^\s]*[a-zA-Z0-9]\.[a-zA-Z0-9][^\s]*/) ){

            errMsg += "Please enter a valid Email."
            setMissedField( "user.email" );

        }
        if( !user.confirmEmail || user.confirmEmail.replace(/[\s]/g,'') === "" ){

            errMsg += "Please enter confirmation Email.\n";
            setMissedField( "user.confirmEmail" );

        }else if( user.email != user.confirmEmail ){

            errMsg += "Email entered is not matching.\n";
            setMissedField( "user.confirmEmail" );

        }
        if( !user.password || user.password === "" ){

            errMsg += "Please enter a password.\n"
            setMissedField( "user.password" );

        }else if( user.password.length < 8 || user.password.length > 16 ){

            errMsg += "Password should be of minimum 8 character and maximum 16 character in length.\n"
            setMissedField( "user.password" );

        }
        if( !user.confirmPassword || user.confirmPassword.replace(/[\s]/g,'') === "" ){

            errMsg += "Please enter confirmation password.\n";
            setMissedField( "user.confirmPassword" );

        }else if( user.password != user.confirmPassword ){

            errMsg += "Password entered is not matching.\n";
            setMissedField( "user.confirmPassword" );

        }

        if( errMsg != "" ){

            $scope.alerts = [{"msg":errMsg}];

        }else {

            $http.post( hostUrl+'/users/adduser', user ).then( function( res ) {

                if( res.data.success > 0 ){

                    console.log('==========SIGN UP====', user);
                    loginService.setUserInfo( user );
                    $rootScope.$emit("logged-in",user);
                    $scope.confirmMessage = "Congrats "+user.firstName+" "+user.lastName+"! You have successfully signed up. Click 'Ok' to continue.";
                    modalService.open($scope, 'html/confirmDialog.html', 'sm', 'confirmWindowClass');

                }else{

                    $scope.alerts = [{"msg":"Email id already exists. Please provide new email id."}];
                    setMissedField( "user.email" );

                }

            });

        }

    };

});

app.controller( "loginController", function( $scope, $uibModal, $rootScope, loginService, modalService ){

    $scope.userInfo = loginService.getUserInfo();
    $scope.isLoggedIn = loginService.isLoggedIn();
    $scope.isConfirmBox = true;
    $scope.isAlertBox = false;
    $scope.openLogin = function(){

        var modalInstance = $uibModal.open( {

            templateUrl: 'html/login.html',
            controller: 'loginPageController',
            size: 'sm',
            backdrop: false

        });

    };
    
    $scope.openSignUp = function(){

        var modalInstance = $uibModal.open( {

            templateUrl: 'html/signup.html',
            controller: 'signUpPageController',
            backdrop: false

        });

    };

    $scope.confirmClose = function(){

        modalService.close();

    };

    $scope.confirmOk = function(){

        modalService.close();
        loginService.clearUserInfo();
        $rootScope.$emit( "logged-out" );
        $scope.isLoggedIn = false;
        $scope.userInfo = {};

    };
    
    $scope.signOut = function(){

        $scope.confirmMessage = ($scope.userInfo.firstName || $scope.userInfo.firstname)+" "+($scope.userInfo.lastName || $scope.userInfo.lastname)+", Are you sure you want to sign out?";
        modalService.open($scope, 'html/confirmDialog.html', 'sm', 'confirmWindowClass');

    };

    //console.log('===============SERVICE UPDATED====', loginService.getUserInfo());
    $rootScope.$on("logged-in",function( event, userInfo ){

        $scope.isLoggedIn = true;
        $scope.userInfo = userInfo;
        console.log('===============SERVICE UPDATED====', loginService.getUserInfo());
        console.log('============LOGGED IN EVENT: ',event, userInfo);

    });

} );

app.controller( "showResultController", function( $scope, $uibModalInstance, $http, $interval, resultInfo ) {

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

        var index = $scope.currentQuestion-1;

        $scope.question = questions[index].questions.question;
        $scope.choices = questions[index].questions.choices;
        $scope.isMulti = questions[index].questions.isMulti;
        $scope.multiOptions = [];
        for( var i = 0, len = $scope.choices.length; i < len; i++ ){

            var selected = false;

            if( $scope.answers[$scope.currentQuestion] && $scope.answers[$scope.currentQuestion].indexOf( $scope.choices[i] ) != -1 ){

                selected = true;

            }

            $scope.multiOptions[ $scope.multiOptions.length ] = { 'index':i, 'name' : $scope.choices[i], 'selected':selected };



        }


    }

    setQuestion();
    
    $scope.multipleAnswerSelected = function( index, answer ){

        $scope.answers[index] = $scope.answers[index] || [];
        var position = $scope.answers[index].indexOf(answer.name);

        if( position == -1 && answer.selected ){

            $scope.answers[index].push(answer.index);

        } else if (!answer.selected && position != -1){

            $scope.answers[index].splice(position, 1);

        }

        $scope.questionIndex[ parseInt(questions[index-1].questions.index) ] = $scope.answers[ index ];
        
    };
    

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
