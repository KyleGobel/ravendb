define(["require", "exports", "durandal/app", "durandal/system", "plugins/router", "models/document", "models/documentMetadata", "commands/saveDocumentCommand", "common/raven", "viewmodels/deleteDocuments", "common/pagedList"], function(require, exports, __app__, __sys__, __router__, __document__, __documentMetadata__, __saveDocumentCommand__, __raven__, __deleteDocuments__, __pagedList__) {
    var app = __app__;
    var sys = __sys__;
    var router = __router__;

    var document = __document__;
    var documentMetadata = __documentMetadata__;
    var saveDocumentCommand = __saveDocumentCommand__;
    var raven = __raven__;
    var deleteDocuments = __deleteDocuments__;
    var pagedList = __pagedList__;

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
            this.docsList = ko.observable();
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
            var _this = this;
            if (navigationArgs && navigationArgs.database) {
                ko.postbox.publish("ActivateDatabaseWithName", navigationArgs.database);
            }

            if (navigationArgs && navigationArgs.list && navigationArgs.item) {
                var itemIndex = parseInt(navigationArgs.item, 10);
                if (!isNaN(itemIndex)) {
                    var collectionName = decodeURIComponent(navigationArgs.list) === "All Documents" ? null : navigationArgs.list;
                    var fetcher = function (skip, take) {
                        return _this.ravenDb.documents(collectionName, skip, take);
                    };
                    var list = new pagedList(fetcher);
                    list.collectionName = navigationArgs.list;
                    list.currentItemIndex(itemIndex);

                    //list.loadNextChunk();
                    this.docsList(list);
                }
            }

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
            jwerty.key("ctrl+alt+s", function (e) {
                e.preventDefault();
                _this.saveDocument();
            }, this, "#editDocumentContainer");

            jwerty.key("ctrl+alt+r", function (e) {
                e.preventDefault();
                _this.refreshDocument();
            }, this, "#editDocumentContainer");

            jwerty.key("ctrl+alt+d", function (e) {
                e.preventDefault();
                _this.isEditingMetadata(false);
            });

            jwerty.key("ctrl+alt+m", function (e) {
                e.preventDefault();
                _this.isEditingMetadata(true);
            });
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
                _this.updateUrl(idAndEtag.Key);
            });
        };

        editDocument.prototype.attachReservedMetaProperties = function (id, target) {
            target['@etag'] = '00000000-0000-0000-0000-000000000000';
            target['Raven-Entity-Name'] = raven.getEntityNameFromId(id);
            target['@id'] = id;
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
                    _this.nextDocumentOrFirst();
                });
                app.showDialog(viewModel);
            }
        };

        editDocument.prototype.nextDocumentOrFirst = function () {
            var list = this.docsList();
            if (list) {
                var nextIndex = list.currentItemIndex() + 1;
                if (nextIndex >= list.totalResultCount()) {
                    nextIndex = 0;
                }
                this.pageToItem(nextIndex);
            }
        };

        editDocument.prototype.previousDocumentOrLast = function () {
            var list = this.docsList();
            if (list) {
                var previousIndex = list.currentItemIndex() - 1;
                if (previousIndex < 0) {
                    previousIndex = list.totalResultCount() - 1;
                }
                this.pageToItem(previousIndex);
            }
        };

        editDocument.prototype.lastDocument = function () {
            var list = this.docsList();
            if (list) {
                this.pageToItem(list.totalResultCount() - 1);
            }
        };

        editDocument.prototype.firstDocument = function () {
            this.pageToItem(0);
        };

        editDocument.prototype.pageToItem = function (index) {
            var _this = this;
            var list = this.docsList();
            if (list) {
                list.getNthItem(index).done(function (doc) {
                    console.log("fetched item at index", index, doc);
                    _this.loadDocument(doc.getId());
                    list.currentItemIndex(index);
                    _this.updateUrl(doc.getId());
                });
            }
        };

        editDocument.prototype.navigateToCollection = function (collectionName) {
            var databaseFragment = raven.activeDatabase() ? "&database=" + raven.activeDatabase().name : "";
            var collectionFragment = collectionName ? "&collection=" + collectionName : "";
            router.navigate("#documents?" + collectionFragment + databaseFragment);
        };

        editDocument.prototype.navigateToDocuments = function () {
            this.navigateToCollection(null);
        };

        editDocument.prototype.updateUrl = function (docId) {
            var docIdPart = "&id=" + encodeURI(docId);
            var databasePart = raven.activeDatabase() ? "&database=" + raven.activeDatabase().name : "";
            var listPart = this.docsList() ? "&list=" + this.docsList().collectionName + "&item=" + this.docsList().currentItemIndex() : "";
            router.navigate("#editDocument" + docIdPart + databasePart + listPart, false);
        };
        return editDocument;
    })();

    
    return editDocument;
});
//# sourceMappingURL=editDocument.js.map
