app.factory( 'modalService', [ '$uibModal', function ($uibModal) {

        var self = this;
        var modalInstance = null;
        self.open = function (scope, path) {

            modalInstance = $uibModal.open({
                templateUrl: path,
                //template:"<div>Test</div>",
                backdrop:false,
                scope: scope
            });

            modalInstance.rendered = function(){
            }

        };

        self.close = function () {
            modalInstance.dismiss('close');
        };

        return self;
    }
]);

app.factory( 'loginService', function(){

    var self = this,
        userInfo = {};

    function getUserDetails(){

        console.log('==========SESSION GETITEM: ',sessionStorage.getItem( "userInfo" ));
        var details = sessionStorage.getItem( "userInfo" ); //$cookieStore.getObject( "userInfo" );
        details = details || "{}";

        return JSON.parse( details );

    }

    self.getUserInfo = function(){

        return getUserDetails();

    };

    self.setUserInfo = function( info ){

        console.log('==========SESSION SETITEM: ',info);
        userInfo = info;
        sessionStorage.setItem( "userInfo", JSON.stringify( userInfo ) ); //$cookieStore.putObject("userInfo",userInfo);


    };


    self.isLoggedIn = function(){

        var info = getUserDetails();
        console.log('================LOGGED IN USER INFO======',info);

        return ( info && typeof info.email != 'undefined');

    };

    self.clearUserInfo = function(){

        sessionStorage.removeItem( "userInfo" );

    }

    return self;

} );

app.factory('localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue || false;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key, defaultValue) {
            if($window.localStorage[key] != undefined){
                return JSON.parse($window.localStorage[key]);
            }else{
                return defaultValue || false;
            }
        },
        remove: function(key){
            $window.localStorage.removeItem(key);
        },
        clear: function(){
            $window.localStorage.clear();
        }
    }
}]);