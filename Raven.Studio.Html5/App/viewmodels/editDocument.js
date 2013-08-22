define(["require", "exports", "durandal/app", "models/document", "models/documentMetadata", "common/raven"], function(require, exports, __app__, __document__, __documentMetadata__, __raven__) {
    var app = __app__;
    

    var document = __document__;
    var documentMetadata = __documentMetadata__;
    var raven = __raven__;

    var editDocument = (function () {
        function editDocument() {
            var _this = this;
            this.document = ko.observable();
            this.ravenDb = new raven();

            this.documentText = ko.computed(function () {
                return _this.document() ? _this.stringify(_this.document().toDto()) : null;
            });
            this.metadata = ko.computed(function () {
                return _this.document() ? _this.document().__metadata : null;
            });
            this.metadataText = ko.computed(function () {
                return _this.metadata() ? _this.stringify(_this.metadata().toDto()) : null;
            });
        }
        editDocument.prototype.activate = function (navigationArgs) {
            var _this = this;
            if (navigationArgs.id) {
                var loadDocTask = this.ravenDb.documentWithMetadata(navigationArgs.id);
                loadDocTask.done(function (document) {
                    return _this.document(document);
                });
                loadDocTask.fail(function (response) {
                    return _this.failedToLoadDoc(navigationArgs.id, response);
                });
                return loadDocTask;
            }
        };

        editDocument.prototype.failedToLoadDoc = function (docId, errorResponse) {
            sys.log("Failed to load document for editing.", errorResponse);
            app.showMessage("Can't edit '" + docId + "'. Details logged in the browser console.", ":-(", ['Dismiss']);
        };

        editDocument.prototype.saveDocument = function () {
            var updatedDto = JSON.parse(this.documentText());
            updatedDto['@metadata'] = JSON.parse(this.metadataText());
            var newDoc = new document(updatedDto);
            this.ravenDb.saveDocument(newDoc).then(function () {
                return console.log("done saving!");
            });
        };

        editDocument.prototype.stringify = function (obj) {
            var prettifySpacing = 4;
            return JSON.stringify(obj, null, prettifySpacing);
        };
        return editDocument;
    })();
    exports.editDocument = editDocument;
});
//# sourceMappingURL=editDocument.js.map
