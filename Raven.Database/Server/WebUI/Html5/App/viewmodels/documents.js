define(["require", "exports", "models/database", "models/collection", "models/document", "common/raven", "common/pagedList"], function(require, exports, __database__, __collection__, __document__, __raven__, __pagedList__) {
    
    

    var database = __database__;
    var collection = __collection__;
    var document = __document__;

    var raven = __raven__;
    var pagedList = __pagedList__;

    var documents = (function () {
        function documents() {
            var _this = this;
            this.displayName = "documents";
            this.collections = ko.observableArray();
            this.selectedCollection = ko.observable().subscribeTo("ActivateCollection");
            this.collectionColors = [];
            this.currentCollectionPagedItems = ko.observable();
            this.ravenDb = new raven();
            this.ravenDb.collections().then(function (results) {
                return _this.collectionsLoaded(results);
            });

            this.selectedCollection.subscribe(function (c) {
                return _this.onSelectedCollectionChanged(c);
            });
        }
        documents.prototype.collectionsLoaded = function (collections) {
            var _this = this;
            var collectionStyleCount = 7;
            collections.forEach(function (c, index) {
                return c.colorClass = "collection-style-" + (index % collectionStyleCount);
            });

            this.allDocumentsCollection = new collection("All Documents");
            this.allDocumentsCollection.colorClass = "all-documents-collection";
            this.allDocumentsCollection.documentCount = ko.computed(function () {
                return _this.collections().filter(function (c) {
                    return c !== _this.allDocumentsCollection;
                }).map(function (c) {
                    return c.documentCount();
                }).reduce(function (first, second) {
                    return first + second;
                }, 0);
            });

            var allCollections = [this.allDocumentsCollection].concat(collections);
            this.collections(allCollections);
            this.allDocumentsCollection.activate();

            collections.forEach(function (c) {
                return _this.fetchTotalDocuments(c);
            });
        };

        documents.prototype.fetchTotalDocuments = function (collection) {
            this.ravenDb.collectionInfo(collection.name).then(function (info) {
                return collection.documentCount(info.totalResults);
            });
        };

        documents.prototype.onSelectedCollectionChanged = function (selected) {
            var _this = this;
            if (collection) {
                var fetcher = function (skip, take) {
                    var collectionName = selected !== _this.allDocumentsCollection ? selected.name : null;
                    return _this.ravenDb.documents(collectionName, skip, take);
                };

                var documentsList = new pagedList(fetcher, 30);
                this.currentCollectionPagedItems(documentsList);
            }
        };
        return documents;
    })();
    exports.documents = documents;
});
//@ sourceMappingURL=documents.js.map
