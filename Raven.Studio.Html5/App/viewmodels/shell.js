define(["require", "exports", "durandal/plugins/router", "durandal/app", "models/database", "common/raven"], function(require, exports, __router__, __app__, __database__, __raven__) {
    var router = __router__;
    var app = __app__;
    var database = __database__;
    var raven = __raven__;

    var shell = (function () {
        function shell() {
            var _this = this;
            this.router = router;
            this.databases = ko.observableArray();
            this.activeDatabase = ko.observable().subscribeTo("ActivateDatabase");
            this.ravenDb = new raven();

            ko.postbox.subscribe("RavenError", function (errorMessage) {
                return _this.onRavenError(errorMessage);
            });
        }
        shell.prototype.databasesLoaded = function (databases) {
            var systemDatabase = new database("<system>");
            systemDatabase.isSystem = true;
            this.databases(databases.concat([systemDatabase]));
            this.databases()[0].activate();
        };

        shell.prototype.activate = function () {
            var _this = this;
            return this.ravenDb.databases().then(function (results) {
                return _this.databasesLoaded(results);
            }).then(function () {
                return router.activate('documents');
            });
        };

        shell.prototype.onRavenError = function (errorMessage) {
            app.showMessage(errorMessage, "RavenDb error");
        };
        return shell;
    })();

    
    return shell;
});
//@ sourceMappingURL=shell.js.map
