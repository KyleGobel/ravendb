define(["require", "exports", "models/database", "models/collection", "models/collectionInfo", "models/document", "common/pagedResultSet"], function(require, exports, __database__, __collection__, __collectionInfo__, __document__, __pagedResultSet__) {
    var database = __database__;
    var collection = __collection__;
    var collectionInfo = __collectionInfo__;
    var document = __document__;
    var pagedResultSet = __pagedResultSet__;

    var raven = (function () {
        function raven() {
            //private baseUrl = "http://localhost:8080"; // For debugging purposes, uncomment this line to point Raven at an already-running Raven server. Requires the Raven server to have it's config set to <add key="Raven/AccessControlAllowOrigin" value="*" />
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

        raven.prototype.document = function (id) {
            var resultsSelector = function (dto) {
                return new document(dto);
            };
            var url = "/docs/" + encodeURIComponent(id);
            return this.fetch(url, null, raven.activeDatabase(), resultsSelector);
        };

        raven.prototype.documentWithMetadata = function (id) {
            var resultsSelector = function (dtoResults) {
                return new document(dtoResults[0]);
            };
            return this.docsById(id, 0, 1, false, resultsSelector);
        };

        raven.prototype.searchIds = function (searchTerm, start, pageSize, metadataOnly) {
            var resultsSelector = function (dtoResults) {
                return dtoResults.map(function (dto) {
                    return new document(dto);
                });
            };
            return this.docsById(searchTerm, start, pageSize, metadataOnly, resultsSelector);
        };

        raven.prototype.deleteDocuments = function (ids) {
            var _this = this;
            var deleteDocs = ids.map(function (id) {
                return _this.createDeleteDocument(id);
            });
            return this.post("/bulk_docs", ko.toJSON(deleteDocs), raven.activeDatabase());
        };

        raven.prototype.deleteCollection = function (collectionName) {
            var args = {
                query: "Tag:" + collectionName,
                pageSize: 128,
                allowStale: true
            };
            return this.delete_("/bulk_docs/Raven/DocumentsByEntityName", args, raven.activeDatabase());
        };

        raven.prototype.saveDocument = function (doc) {
            var customHeaders = {
                'Raven-Client-Version': '2.5.0.0',
                'Raven-Entity-Name': doc.__metadata.ravenEntityName,
                'Raven-Clr-Type': doc.__metadata.ravenClrType,
                'If-None-Match': doc.__metadata.etag
            };
            var args = JSON.stringify(doc.toDto());
            var url = "/docs/" + doc.__metadata.id;
            return this.put(url, args, raven.activeDatabase(), customHeaders);
        };

        raven.prototype.getBaseUrl = function () {
            return this.baseUrl;
        };

        raven.prototype.getDatabaseUrl = function () {
            var database = raven.activeDatabase();
            if (database) {
                return this.baseUrl + (database && database.isSystem === false ? "/databases/" + database.name : "");
            }

            return this.baseUrl;
        };

        raven.prototype.docsById = function (idOrPartialId, start, pageSize, metadataOnly, resultsSelector) {
            var url = "/docs/";
            var args = {
                startsWith: idOrPartialId,
                start: start,
                pageSize: pageSize
            };
            return this.fetch(url, args, raven.activeDatabase(), resultsSelector);
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
                ajax.fail(function (request, status, error) {
                    return task.reject(request, status, error);
                });
                return task;
            } else {
                return ajax;
            }
        };

        raven.prototype.post = function (relativeUrl, args, database, customHeaders) {
            return this.ajax(relativeUrl, args, "POST", database, customHeaders);
        };

        raven.prototype.put = function (relativeUrl, args, database, customHeaders) {
            return this.ajax(relativeUrl, args, "PUT", database, customHeaders);
        };

        raven.prototype.delete_ = function (relativeUrl, args, database, customHeaders) {
            return this.ajax(relativeUrl, args, "DELETE", database, customHeaders);
        };

        raven.prototype.ajax = function (relativeUrl, args, method, database, customHeaders) {
            var options = {
                cache: false,
                url: this.getDatabaseUrl() + relativeUrl,
                data: args,
                contentType: "application/json; charset=utf-8",
                type: method,
                headers: undefined
            };

            if (customHeaders) {
                options.headers = customHeaders;
            }

            return $.ajax(options);
        };
        raven.activeDatabase = ko.observable().subscribeTo("ActivateDatabase");
        return raven;
    })();

    
    return raven;
});
//# sourceMappingURL=raven.js.map
