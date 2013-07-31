///<reference path="../durandal/typings/durandal.d.ts"/>
import http = module("durandal/http");
import app = module("durandal/app");
import sys = module("durandal/system");

import document = module("models/document");
import documentMetadata = module("models/documentMetadata");
import raven = module("common/raven");

export class editDocument {

    ravenDb: raven;
	document = ko.observable<document>();
	metadata: KnockoutComputed<documentMetadata>;
	documentText: KnockoutComputed<string>;
	metadataText: KnockoutComputed<string>;
	
    constructor() {
		this.ravenDb = new raven();

		this.documentText = ko.computed(() => this.document() ? this.stringify(this.document().toDto()) : null);
		this.metadata = ko.computed(() => this.document() ? this.document().__metadata : null);
		this.metadataText = ko.computed(() => this.metadata() ? this.stringify(this.metadata().toDto()) : null);
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