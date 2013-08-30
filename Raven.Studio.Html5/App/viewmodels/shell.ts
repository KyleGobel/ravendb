/// <reference path="../../Scripts/typings/bootstrap/bootstrap.d.ts" />

import router = require("plugins/router");
import app = require("durandal/app");
import sys = require("durandal/system");

import database = require("models/database");
import raven = require("common/raven");
import document = require("models/document");
import collection = require("models/collection");
import deleteDocuments = require("viewmodels/deleteDocuments");
import dialogResult = require("common/dialogResult");

class shell {
    private router = router; 
    databases = ko.observableArray<database>();
    activeDatabase = ko.observable<database>().subscribeTo("ActivateDatabase");
    ravenDb: raven;

    constructor() {
        this.ravenDb = new raven();
        ko.postbox.subscribe("EditDocument", args => this.launchDocEditor(args.doc.getId()));
        ko.postbox.subscribe("DeleteCollection", args => this.showDeleteCollectionPrompt(args));
        //sys.log("Failed to delete items", response);
        //app.showMessage("An error occurred deleting the item(s). Details in the browser console.", ":-(");
    }

    databasesLoaded(databases) {
        var systemDatabase = new database("<system>");
        systemDatabase.isSystem = true;
        this.databases(databases.concat([systemDatabase]));
        this.databases()[0].activate();
    }

    launchDocEditor(docId: string) {
        router.navigate("#edit?id=" + encodeURIComponent(docId))
	}

    activate() {

        router.map([
            { route: '', title: 'Documents', moduleId: 'viewmodels/documents', nav: true },
            { route: 'indexes', title: 'Indexes', moduleId: 'viewmodels/indexes', nav: true },
            { route: 'query', title: 'Query', moduleId: 'viewmodels/query', nav: true },
            { route: 'tasks', title: 'Tasks', moduleId: 'viewmodels/tasks', nav: true },
            { route: 'settings', title: 'Settings', moduleId: 'viewmodels/settings', nav: true },
            { route: 'status', title: 'Status', moduleId: 'viewmodels/status', nav: true },
            { route: 'edit', title: 'Edit Document', moduleId: 'viewmodels/editDocument', nav: false }
        ]).buildNavigationModel();

        // Activate the first page only after we've connected to Raven
        // and selected the first database.
        return this.ravenDb
            .databases()
            .fail(result => {
                sys.log("Unable to connect to Raven.", result);
                app.showMessage("Couldn't connect to Raven. Details in the browser console.", ":-(", ['Dismiss']);
                $('.splash').hide();
            })
            .then(results => this.databasesLoaded(results))
            .then(() => router.activate());

        return router.activate();
    }

    showDeleteCollectionPrompt(args: { collection: collection }) {
    }
}

export = shell;