define(["require", "exports", "models/database"], function(require, exports, __database__) {
    var database = __database__;

    var raven = (function () {
        function raven() {
            this.baseUrl = "http://localhost:8080";
        }
        raven.prototype.databases = function () {
            var deferred = $.Deferred();
            this.fetch("/databases", { pageSize: 1024 }).done(function (databaseNames) {
                var databases = databaseNames.map(function (n) {
                    return new database(n);
                });
                deferred.resolve(databases);
            });
            return deferred;
        };

        raven.prototype.collections = function (database) {
            var args = {
                field: "Tag",
                fromValue: "",
                pageSize: 100
            };
            return this.fetch("/terms/Raven/DocumentsByEntityName", args, database);
        };

        raven.prototype.fetch = function (relativeUrl, args, database) {
            return $.ajax({
                cache: false,
                url: this.baseUrl + (database ? "/" + database.name : "") + relativeUrl,
                data: args
            });
        };
        return raven;
    })();
    
    return raven;
});
