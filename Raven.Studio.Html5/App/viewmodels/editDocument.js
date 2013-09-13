/// <reference path="../../Scripts/typings/ace/ace.d.ts" />
define(["require", "exports", "durandal/app", "durandal/system", "plugins/router", "models/document", "models/documentMetadata", "commands/saveDocumentCommand", "common/raven", "viewmodels/deleteDocuments"], function(require, exports, __app__, __sys__, __router__, __document__, __documentMetadata__, __saveDocumentCommand__, __raven__, __deleteDocuments__) {
    var app = __app__;
    var sys = __sys__;
    var router = __router__;
    var ace = require("AceAjax");

    var document = __document__;
    var documentMetadata = __documentMetadata__;
    var saveDocumentCommand = __saveDocumentCommand__;
    var raven = __raven__;
    var deleteDocuments = __deleteDocuments__;

    var editDocument = (function () {
        function editDocument() {
            var _this = this;
            this.document = ko.observable();
            this.documentText = ko.observable('');
            this.metadataText = ko.observable('');
            this.isEditingMetadata = ko.observable(false);
            this.isBusy = ko.observable(false);
            this.metaPropsToRestoreOnSave = [];
            this.userSpecifiedId = ko.observable('');
            this.isCreatingNewDocument = ko.observable(false);
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
                    _this.userSpecifiedId(meta.id);
                }
            });

            this.editedDocId = ko.computed(function () {
                return _this.metadata() ? _this.metadata().id : '';
            });
        }
        editDocument.prototype.activate = function (navigationArgs) {
            console.log("activated!");
            console.log("here is ace: ", ace);

            if (navigationArgs && navigationArgs.id) {
                return this.loadDocument(navigationArgs.id);
            } else {
                this.editNewDocument();
            }
        };

        editDocument.prototype.editNewDocument = function () {
            this.isCreatingNewDocument(true);
            this.document(document.empty());
        };

        editDocument.prototype.attached = function () {
            var _this = this;
            jwerty.key("ctrl+s", function (e) {
                e.preventDefault();
                _this.saveDocument();
            }, this, "#editDocumentContainer");

            jwerty.key("ctrl+r", function (e) {
                e.preventDefault();
                _this.refreshDocument();
            }, this, "#editDocumentContainer");
        };

        editDocument.prototype.deactivate = function () {
            $("#editDocumentContainer").unbind('keydown.jwerty');
        };

        editDocument.prototype.failedToLoadDoc = function (docId, errorResponse) {
            sys.log("Failed to load document for editing.", errorResponse);
            app.showMessage("Can't edit '" + docId + "'. Details logged in the browser console.", ":-(", ['Dismiss']);
        };

        editDocument.prototype.saveDocument = function () {
            var _this = this;
            var updatedDto = JSON.parse(this.documentText());
            var meta = JSON.parse(this.metadataText());
            updatedDto['@metadata'] = meta;

            if (this.isCreatingNewDocument()) {
                this.attachReservedMetaProperties(this.userSpecifiedId(), meta);
            } else {
                // If we're editing a document, we hide some reserved properties from the user.
                // Restore these before we save.
                this.metaPropsToRestoreOnSave.forEach(function (p) {
                    return meta[p.name] = p.value;
                });
            }

            var newDoc = new document(updatedDto);
            var saveCommand = new saveDocumentCommand(this.userSpecifiedId(), newDoc);
            var saveTask = saveCommand.execute();
            saveTask.done(function (idAndEtag) {
                _this.isCreatingNewDocument(false);
                _this.loadDocument(idAndEtag.Key);
                router.navigate("#editDocument?id=" + idAndEtag.Key, false);
            });
        };

        editDocument.prototype.attachReservedMetaProperties = function (id, target) {
            target['@etag'] = '00000000-0000-0000-0000-000000000000';
            target['Raven-Entity-Name'] = this.getEntityNameFromId(id);
            target['@id'] = id;
        };

        editDocument.prototype.getEntityNameFromId = function (id) {
            // TODO: is there a better way to do this?
            var slashIndex = id.indexOf('/');
            if (slashIndex >= 1) {
                return id.substring(0, slashIndex);
            }

            return id;
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
            if (!this.isCreatingNewDocument()) {
                this.document(null);
                this.documentText(null);
                this.metadataText(null);
                this.userSpecifiedId('');
                this.loadDocument(this.editedDocId());
            } else {
                this.editNewDocument();
            }
        };

        editDocument.prototype.deleteDocument = function () {
            var _this = this;
            var doc = this.document();
            if (doc) {
                var viewModel = new deleteDocuments([doc]);
                viewModel.deletionTask.done(function () {
                    return _this.nextDocumentOrFirst();
                });
                app.showDialog(viewModel);
            }
        };

        editDocument.prototype.nextDocumentOrFirst = function () {
            // TODO: implement editDoc.nextDocOrFirst
            // For now, just head back to documents.
            router.navigate("#documents");
        };
        return editDocument;
    })();

    
    return editDocument;
});
//# sourceMappingURL=editDocument.js.map
