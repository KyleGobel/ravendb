define(["require", "exports", "models/database", "models/database"], function(require, exports, __database__, __collection__) {
    var database = __database__;
    var collection = __collection__;

    var raven = (function () {
        function raven() {
            this.baseUrl = "http://localhost:8080";
        }
        raven.prototype.databases = function () {
            var resultsSelector = function (databaseNames) {
                return databaseNames.map(function (n) {
                    return new database(n);
                });
            };
            return this.fetch("/databases", { pageSize: 1024 }, null, resultsSelector);
        };

        raven.prototype.collections = function () {
            this.requireActiveDatabase();

            var args = {
                field: "Tag",
                fromValue: "",
                pageSize: 100
            };
            var resultsSelector = function (collectionNames) {
                return collectionNames.map(function (n) {
                    return new collection(n);
                });
            };
            return this.fetch("/terms/Raven/DocumentsByEntityName", args, raven.activeDatabase(), resultsSelector);
        };

        raven.prototype.requireActiveDatabase = function () {
            if (!raven.activeDatabase()) {
                throw new Error("Must have an active database before calling this method.");
            }
        };

        raven.prototype.fetch = function (relativeUrl, args, database, resultsSelector) {
            var ajax = $.ajax({
                cache: false,
                url: this.baseUrl + (database ? "/databases/" + database.name : "") + relativeUrl,
                data: args
            });

            if (resultsSelector) {
                var task = $.Deferred();
                ajax.done(function (results) {
                    var transformedResults = resultsSelector(results);
                    task.resolve(transformedResults);
                });
                return task;
            } else {
                return ajax;
            }
        };
        raven.activeDatabase = ko.observable().subscribeTo("ActivateDatabase");
        return raven;
    })();

    
    return raven;
});
//@ sourceMappingURL=raven.js.map
