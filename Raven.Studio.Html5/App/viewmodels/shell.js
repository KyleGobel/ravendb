define(["require", "exports", "durandal/plugins/router", "durandal/app", "models/database", "common/raven"], function(require, exports, __router__, __app__, __database__, __raven__) {
    var router = __router__;
    var app = __app__;
    var database = __database__;
    var raven = __raven__;

    var shell = (function () {
        function shell() {
            this.router = router;
            this.databases = ko.observableArray();
            this.activeDatabase = ko.observable().subscribeTo("ActivateDatabase");
            this.ravenDb = new raven();
        }
        shell.prototype.databasesLoaded = function (databases) {
            this.databases(databases);
            this.databases()[0].activate();
        };

        shell.prototype.search = function () {
            app.showMessage('Search not yet implemented...');
        };

        shell.prototype.activate = function () {
            var _this = this;
            return this.ravenDb.databases().then(function (results) {
                return _this.databasesLoaded(results);
            }).then(function () {
                return router.activate('documents');
            });
        };
        return shell;
    })();

    
    return shell;
});
//@ sourceMappingURL=shell.js.map
