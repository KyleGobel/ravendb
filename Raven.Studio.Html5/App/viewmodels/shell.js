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
            this.activeDatabase = ko.observable();
            this.ravenDb = new raven();
            this.ravenDb.databases().then(function (databases) {
                return _this.databasesLoaded(databases);
            });
        }
        shell.prototype.databasesLoaded = function (databases) {
            this.databases(databases);
            if (databases.length > 0) {
                this.activeDatabase(databases[0]);
            }
        };

        shell.prototype.search = function () {
            app.showMessage('Search not yet implemented...');
        };

        shell.prototype.activate = function () {
            return router.activate('documents');
        };
        return shell;
    })();
    
    return shell;
});
