///<reference path="../durandal/typings/durandal.d.ts"/>
import http = module("durandal/http");
import app = module("durandal/app");
import sys = module("durandal/system");

import document = module("models/document");
import raven = module("common/raven");

export class editDocument {

    ravenDb: raven;
    document = ko.observable<document>();
    documentText = ko.observable<string>();

    constructor() {
        this.ravenDb = new raven();
    }

    activate(navigationArgs) {
        if (navigationArgs.id) {
            var loadDocTask = this.ravenDb.documentWithMetadata(navigationArgs.id);
            loadDocTask.done(document => {
                // Temporarily remove the metadata while we stringify it.
                var meta = document.__metadata;
                document.__metadata = undefined;
                this.documentText(JSON.stringify(document, null, 4));
                
                // Put the metadata back.
                document.__metadata = meta;
                this.document(document);
            });
            loadDocTask.fail(response => {
                sys.log("Failed to load document for editing.", response);
                app.showMessage("Couldn't edit '" + navigationArgs.id + "'. Details logged in the browser console.", ":-(", ['Dismiss']);
            });
            return loadDocTask;
        }
    }
}