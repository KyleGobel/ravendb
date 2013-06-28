define(["require", "exports", "models/database", "models/collection", "common/raven"], function(require, exports, __database__, __collection__, __raven__) {
    
    
    var database = __database__;
    var collection = __collection__;
    var raven = __raven__;

    var documents = (function () {
        function documents() {
            this.displayName = "documents";
            this.collections = ko.observableArray();
            this.selectedCollection = ko.observable().subscribeTo("ActivateCollection");
            this.collectionColors = [];
            this.ravenDb = new raven();
        }
        documents.prototype.activate = function () {
            var _this = this;
            this.ravenDb.collections().then(function (results) {
                return _this.loadCollections(results);
            });
        };

        documents.prototype.loadCollections = function (collections) {
            var _this = this;
            var collectionStyleCount = 7;
            collections.forEach(function (c, index) {
                return c.colorClass = "collection-style-" + (index % collectionStyleCount);
            });

            var allDocuments = new collection("All Documents");
            allDocuments.colorClass = "all-documents-collection";
            allDocuments.documentCount = ko.computed(function () {
                return _this.collections().filter(function (c) {
                    return c !== allDocuments;
                }).map(function (c) {
                    return c.documentCount();
                }).reduce(function (first, second) {
                    return first + second;
                }, 0);
            });

            var allCollections = [allDocuments].concat(collections);
            this.collections(allCollections);
        };

        documents.prototype.canDeactivate = function () {
            return true;
        };
        return documents;
    })();
    exports.documents = documents;
});
