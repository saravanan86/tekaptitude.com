app.factory('modalService', [ '$uibModal', function ($uibModal) {

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
                console.log('======MODAL WINDOW IS OPENED====');
            }
            console.log('=====MODAL window open is called 2');
        };

        self.close = function () {
            modalInstance.dismiss('close');
        };

        return self;
    }
]);