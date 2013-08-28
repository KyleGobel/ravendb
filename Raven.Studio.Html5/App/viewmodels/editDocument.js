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
            this.isEditingMetadata = ko.observable(false);
            this.isBusy = ko.observable(false);
            this.metaPropsToRestoreOnSave = [];
            this.ravenDb = new raven();
            this.metadata = ko.computed(function () {
                return _this.document() ? _this.document().__metadata : null;
            });
            this.documentTextOrMetaText = ko.computed({
                read: function () {
                    return _this.isEditingMetadata() ? _this.metadataText() : _this.documentText();
                },
                write: function (val) {
                    if (_this.isEditingMetadata()) {
                        _this.metadataText(val);
                    } else {
                        _this.documentText(val);
                    }
                }
            });

            this.document.subscribe(function (doc) {
                if (doc) {
                    var docText = _this.stringify(doc.toDto());
                    _this.documentText(docText);
                }
            });

            this.metadata.subscribe(function (meta) {
                if (meta) {
                    _this.metaPropsToRestoreOnSave.length = 0;
                    var metaDto = _this.metadata().toDto();

                    // We don't want to show certain reserved properties in the metadata text area.
                    // Remove them from the DTO, restore them on save.
                    var metaPropsToRemove = ["Non-Authoritative-Information", "@id", "Last-Modified", "Raven-Last-Modified", "@etag", "Origin"];
                    metaPropsToRemove.forEach(function (p) {
                        if (metaDto[p]) {
                            delete metaDto[p];
                            _this.metaPropsToRestoreOnSave.push({ name: p, value: metaDto[p] });
                        }
                    });
                    var metaString = _this.stringify(metaDto);
                    _this.metadataText(metaString);
                }
            });
        }
        editDocument.prototype.activate = function (navigationArgs) {
            if (navigationArgs.id) {
                return this.loadDocument(navigationArgs.id);
            }
        };

        editDocument.prototype.failedToLoadDoc = function (docId, errorResponse) {
            sys.log("Failed to load document for editing.", errorResponse);
            app.showMessage("Can't edit '" + docId + "'. Details logged in the browser console.", ":-(", ['Dismiss']);
        };

        editDocument.prototype.saveDocument = function () {
            var _this = this;
            var updatedDto = JSON.parse(this.documentText());
            updatedDto['@metadata'] = JSON.parse(this.metadataText());
            this.metaPropsToRestoreOnSave.forEach(function (p) {
                return updatedDto[p.name] = p.value;
            });
            var newDoc = new document(updatedDto);
            this.ravenDb.saveDocument(newDoc).then(function (idAndEtag) {
                return _this.loadDocument(idAndEtag.Key);
            });
        };

        editDocument.prototype.stringify = function (obj) {
            var prettifySpacing = 4;
            return JSON.stringify(obj, null, prettifySpacing);
        };

        editDocument.prototype.activateMeta = function () {
            this.isEditingMetadata(true);
        };

        editDocument.prototype.activateDoc = function () {
            this.isEditingMetadata(false);
        };

        editDocument.prototype.loadDocument = function (id) {
            var _this = this;
            var loadDocTask = this.ravenDb.documentWithMetadata(id);
            loadDocTask.done(function (document) {
                return _this.document(document);
            });
            loadDocTask.fail(function (response) {
                return _this.failedToLoadDoc(id, response);
            });
            loadDocTask.always(function () {
                return _this.isBusy(false);
            });
            this.isBusy(true);
            return loadDocTask;
        };

        editDocument.prototype.refreshDocument = function () {
            var meta = this.metadata();
            if (meta) {
                this.loadDocument(meta.id);
                this.document(null);
                this.documentText(null);
                this.metadata(null);
                this.metadataText(null);
            }
        };

        editDocument.prototype.deleteDocument = function () {
            var _this = this;
            var doc = this.document();
            if (doc) {
                var deleteArgs = { items: [doc], callback: function () {
                        return _this.nextDocumentOrFirst();
                    } };
                ko.postbox.publish("DeleteDocuments", deleteArgs);
            }
        };

        editDocument.prototype.nextDocumentOrFirst = function () {
        };
        return editDocument;
    })();

    
    return editDocument;
});
//# sourceMappingURL=editDocument.js.map
