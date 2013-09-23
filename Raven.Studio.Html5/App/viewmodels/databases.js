define(["require", "exports", "durandal/app", "plugins/router", "common/raven", "models/database", "viewmodels/createDatabase"], function(require, exports, __app__, __router__, __raven__, __database__, __createDatabase__) {
    var app = __app__;
    
    var router = __router__;

    var raven = __raven__;
    var database = __database__;
    var createDatabase = __createDatabase__;

    var databases = (function () {
        function databases() {
            this.databases = ko.observableArray();
            this.ravenDb = new raven();
        }
        databases.prototype.activate = function (navigationArgs) {
            var _this = this;
            this.ravenDb.databases().done(function (results) {
                return _this.databases(results);
            });
        };

        databases.prototype.navigateToDocuments = function (db) {
            db.activate();
            router.navigate("#documents?db=" + encodeURIComponent(db.name));
        };

        databases.prototype.newDatabase = function () {
            var _this = this;
            var createDatabaseViewModel = new createDatabase();
            createDatabaseViewModel.creationTask.done(function (databaseName) {
                return _this.databases.push(new database(databaseName));
            });
            app.showDialog(createDatabaseViewModel);
        };
        return databases;
    })();

    
    return databases;
});
//# sourceMappingURL=databases.js.map
