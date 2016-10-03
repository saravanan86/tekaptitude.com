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

app.factory( 'loginService', [ '$cookies', function($cookies){

    var self = this,
        userInfo = {};

    self.getUserInfo = function(){

        return userInfo;

    };

    self.setUserInfo = function( info ){

        userInfo = info;

    };


    self.isLoggedIn = function(){

        return (userInfo.email != 'undefined');

    };

    return self;

}] );