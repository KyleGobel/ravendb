import app = require("durandal/app");
import sys = require("durandal/system");

import document = require("models/document");
import documentMetadata = require("models/documentMetadata");
import raven = require("common/raven");

class editDocument {

    ravenDb: raven;
    document = ko.observable<document>();
    metadata: KnockoutComputed<documentMetadata>;
    documentText = ko.observable('');
    metadataText = ko.observable('');

    constructor() {
        this.ravenDb = new raven();
        this.metadata = ko.computed(() => this.document() ? this.document().__metadata : null);

        this.document.subscribe(doc => {
            if (doc) {
                var docText = this.stringify(doc.toDto());
                this.documentText(docText);
            }
        });
        this.metadata.subscribe(meta => {
            if (meta) {
                var metaString = this.stringify(this.metadata().toDto())
                this.metadataText(metaString);
            }
        });
    }

    activate(navigationArgs) {
        if (navigationArgs.id) {
            var loadDocTask = this.ravenDb.documentWithMetadata(navigationArgs.id);
            loadDocTask.done(document => this.document(document));
            loadDocTask.fail(response => this.failedToLoadDoc(navigationArgs.id, response));
            return loadDocTask;
        }
    }

    failedToLoadDoc(docId, errorResponse) {
        sys.log("Failed to load document for editing.", errorResponse);
        app.showMessage("Can't edit '" + docId + "'. Details logged in the browser console.", ":-(", ['Dismiss']);
    }

    saveDocument() {
        var updatedDto = JSON.parse(this.documentText());
        updatedDto['@metadata'] = JSON.parse(this.metadataText());
        var newDoc = new document(updatedDto);
        this.ravenDb
            .saveDocument(newDoc)
            .then(() => console.log("done saving!"));
    }

    stringify(obj: any) {
        var prettifySpacing = 4;
        return JSON.stringify(obj, null, prettifySpacing);
    }
}

export = editDocument;