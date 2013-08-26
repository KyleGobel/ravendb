define(["require", "exports", "durandal/app", "durandal/system", "models/document", "models/documentMetadata", "common/raven"], function(require, exports, __app__, __sys__, __document__, __documentMetadata__, __raven__) {
    var app = __app__;
    var sys = __sys__;

    var document = __document__;
    var documentMetadata = __documentMetadata__;
    var raven = __raven__;

    var editDocument = (function () {
        function editDocument() {
            var _this = this;
            this.document = ko.observable();
            this.documentText = ko.observable('');
            this.metadataText = ko.observable('');
            this.ravenDb = new raven();
            this.metadata = ko.computed(function () {
                return _this.document() ? _this.document().__metadata : null;
            });

            this.document.subscribe(function (doc) {
                if (doc) {
                    var docText = _this.stringify(doc.toDto());
                    _this.documentText(docText);
                }
            });
            this.metadata.subscribe(function (meta) {
                if (meta) {
                    var metaString = _this.stringify(_this.metadata().toDto());
                    _this.metadataText(metaString);
                }
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

    
    return editDocument;
});
//# sourceMappingURL=editDocument.js.map
