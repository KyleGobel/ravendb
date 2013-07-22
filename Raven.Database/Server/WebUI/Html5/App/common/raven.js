define(["require", "exports", "models/database", "models/collection", "models/collectionInfo", "models/document", "common/pagedResultSet"], function(require, exports, __database__, __collection__, __collectionInfo__, __document__, __pagedResultSet__) {
    var database = __database__;
    var collection = __collection__;
    var collectionInfo = __collectionInfo__;
    var document = __document__;
    var pagedResultSet = __pagedResultSet__;

    var raven = (function () {
        function raven() {
            this.baseUrl = "";
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

        raven.prototype.collectionInfo = function (collectionName, documentsSkip, documentsTake) {
            if (typeof documentsSkip === "undefined") { documentsSkip = 0; }
            if (typeof documentsTake === "undefined") { documentsTake = 0; }
            this.requireActiveDatabase();

            var args = {
                query: collectionName ? "Tag:" + collectionName : undefined,
                start: documentsSkip,
                pageSize: documentsTake
            };

            var resultsSelector = function (dto) {
                return new collectionInfo(dto);
            };
            var url = "/indexes/Raven/DocumentsByEntityName";
            return this.fetch(url, args, raven.activeDatabase(), resultsSelector);
        };

        raven.prototype.documents = function (collectionName, skip, take) {
            if (typeof skip === "undefined") { skip = 0; }
            if (typeof take === "undefined") { take = 30; }
            this.requireActiveDatabase();

            var documentsTask = $.Deferred();
            this.collectionInfo(collectionName, skip, take).then(function (collection) {
                var items = collection.results;
                var resultSet = new pagedResultSet(items, collection.totalResults);
                documentsTask.resolve(resultSet);
            });
            return documentsTask;
        };

        raven.prototype.deleteDocuments = function (ids) {
            var _this = this;
            this.requireActiveDatabase();

            var deleteDocs = ids.map(function (id) {
                return _this.createDeleteDocument(id);
            });

            return this.post("/bulk_docs", ko.toJSON(deleteDocs), raven.activeDatabase());
        };

        raven.prototype.createDeleteDocument = function (id) {
            return {
                Key: id,
                Method: "DELETE",
                Etag: null,
                AdditionalData: null
            };
        };

        raven.prototype.requireActiveDatabase = function () {
            if (!raven.activeDatabase()) {
                throw new Error("Must have an active database before calling this method.");
            }
        };

        raven.prototype.fetch = function (relativeUrl, args, database, resultsSelector) {
            var ajax = this.ajax(relativeUrl, args, "GET", database);

            var foo = null;
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

        raven.prototype.post = function (relativeUrl, args, database, customHeaders) {
            return this.ajax(relativeUrl, args, "POST", database, customHeaders);
        };

        raven.prototype.ajax = function (relativeUrl, args, method, database, customHeaders) {
            var options = {
                cache: false,
                url: this.baseUrl + (database && database.isSystem === false ? "/databases/" + database.name : "") + relativeUrl,
                data: args,
                type: method
            };

            if (customHeaders) {
                for (var prop in customHeaders) {
                    options[prop] = customHeaders[prop];
                }
            }

            var ajax = $.ajax(options);
            ajax.fail(function (request, status, error) {
                var errorMessage = request.responseText ? request.responseText : "Error calling " + relativeUrl;
                ko.postbox.publish("RavenError", errorMessage);
            });

            return ajax;
        };
        raven.activeDatabase = ko.observable().subscribeTo("ActivateDatabase");
        return raven;
    })();

    
    return raven;
});
//@ sourceMappingURL=raven.js.map
