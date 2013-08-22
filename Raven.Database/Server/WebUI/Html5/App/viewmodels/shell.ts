/// <reference path="../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />
/// <reference path="../durandal/typings/durandal.d.ts"/>

import router = require("durandal/plugins/router");
import app = require("durandal/app");
import sys = require("durandal/system");

import database = require("models/database");
import raven = require("common/raven");

class shell {

    //router = router; 
	databases = ko.observableArray<database>(); 
	activeDatabase = ko.observable<database>().subscribeTo("ActivateDatabase");
	ravenDb: raven;

	constructor() {
		this.ravenDb = new raven();
        console.log("yes to the shell!");
		ko.postbox.subscribe("EditDocument", args => this.launchDocEditor(args.doc.getId()));
    }

    databasesLoaded(databases) {
        var systemDatabase = new database("<system>");
        systemDatabase.isSystem = true;
		this.databases(databases.concat([systemDatabase]));
		this.databases()[0].activate();
    }

	activate() {
    
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
            .then(() => router.activate('documents'));
	}

	launchDocEditor(docId: string) {
		router.navigateTo("#edit?id=" + encodeURIComponent(docId))
	}
}

export = shell; 