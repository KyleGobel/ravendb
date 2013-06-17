define(["require", "exports", "durandal/plugins/router", "durandal/app"], function(require, exports, __router__, __app__) {
    var router = __router__;

    var app = __app__;

    var shell = (function () {
        function shell() {
            this.router = router;
        }
        shell.prototype.search = function () {
            app.showMessage('Search not yet implemented...');
        };
        shell.prototype.activate = function () {
            return router.activate('documents');
        };
        return shell;
    })();
    exports.shell = shell;    
    new shell();
})
