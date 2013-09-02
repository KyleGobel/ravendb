define(["require", "exports", "plugins/router", "common/raven", "models/database"], function(require, exports, __router__, __raven__, __database__) {
    
    
    var router = __router__;

    var raven = __raven__;
    var database = __database__;

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
        return databases;
    })();

    
    return databases;
});
//# sourceMappingURL=databases.js.map
