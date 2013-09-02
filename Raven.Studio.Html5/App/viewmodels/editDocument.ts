import app = require("durandal/app");
import sys = require("durandal/system");

import document = require("models/document");
import documentMetadata = require("models/documentMetadata");
import saveDocumentCommand = require("commands/saveDocumentCommand");
import raven = require("common/raven");
import deleteDocuments = require("viewmodels/deleteDocuments");

class editDocument {

    ravenDb: raven;
    document = ko.observable<document>();
    metadata: KnockoutComputed<documentMetadata>;
    documentText = ko.observable('');
    metadataText = ko.observable('');
    documentTextOrMetaText: KnockoutComputed<string>;
    isEditingMetadata = ko.observable(false);
    isBusy = ko.observable(false);
    metaPropsToRestoreOnSave = [];
    userSpecifiedId = ko.observable('');

    constructor() {
        this.ravenDb = new raven();
        this.metadata = ko.computed(() => this.document() ? this.document().__metadata : null);
        this.documentTextOrMetaText = ko.computed({
            read: () => this.isEditingMetadata() ? this.metadataText() : this.documentText(),
            write: (val) => {
                if (this.isEditingMetadata()) {
                    this.metadataText(val);
                } else {
                    this.documentText(val);
                }
            }
        });

        this.document.subscribe(doc => {
            if (doc) {
                var docText = this.stringify(doc.toDto());
                this.documentText(docText);
            }
        });

        this.metadata.subscribe((meta: documentMetadata) => {
            if (meta) {
                this.metaPropsToRestoreOnSave.length = 0;
                var metaDto = this.metadata().toDto();

                // We don't want to show certain reserved properties in the metadata text area.
                // Remove them from the DTO, restore them on save.
                var metaPropsToRemove = ["Non-Authoritative-Information", "@id", "Last-Modified", "Raven-Last-Modified", "@etag", "Origin"];
                metaPropsToRemove.forEach(p => {
                    if (metaDto[p]) {
                        delete metaDto[p];
                        this.metaPropsToRestoreOnSave.push({ name: p, value: metaDto[p] });
                    }
                });
                var metaString = this.stringify(metaDto);
                this.metadataText(metaString);
                this.userSpecifiedId(meta.id);
            }
        });
    }

    activate(navigationArgs) {
        if (navigationArgs.id) {
            return this.loadDocument(navigationArgs.id);
        }
    }

    failedToLoadDoc(docId, errorResponse) {
        sys.log("Failed to load document for editing.", errorResponse);
        app.showMessage("Can't edit '" + docId + "'. Details logged in the browser console.", ":-(", ['Dismiss']);
    }

    saveDocument() {
        var updatedDto = JSON.parse(this.documentText());
        updatedDto['@metadata'] = JSON.parse(this.metadataText());
        this.metaPropsToRestoreOnSave.forEach(p => updatedDto[p.name] = p.value);
        var newDoc = new document(updatedDto);
        newDoc.__metadata.id = this.userSpecifiedId();

        var saveCommand = new saveDocumentCommand(newDoc);
        var saveTask = saveCommand.execute();
        saveTask
            .done(idAndEtag => this.loadDocument(idAndEtag.Key));
    }

    stringify(obj: any) {
        var prettifySpacing = 4;
        return JSON.stringify(obj, null, prettifySpacing);
    }

    activateMeta() {
        this.isEditingMetadata(true);
    }

    activateDoc() {
        this.isEditingMetadata(false);
    }

    loadDocument(id: string): JQueryPromise<document> {
        var loadDocTask = this.ravenDb.documentWithMetadata(id);
        loadDocTask.done(document => this.document(document));
        loadDocTask.fail(response => this.failedToLoadDoc(id, response));
        loadDocTask.always(() => this.isBusy(false));
        this.isBusy(true);
        return loadDocTask;
    }

    refreshDocument() {
        var meta = this.metadata();
        if (meta) {
            this.loadDocument(meta.id);
            this.document(null);
            this.documentText(null);
            this.metadata(null);
            this.metadataText(null);
        }
    }

    deleteDocument() {
        var doc = this.document();
        if (doc) {
            var viewModel = new deleteDocuments([doc]);
            viewModel.deletionTask.done(() => this.nextDocumentOrFirst());
            app.showDialog(viewModel);
        }
    }

    nextDocumentOrFirst() {
        // TODO: implement editDoc.nextDocOrFirst
    }
}

export = editDocument;