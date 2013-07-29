/// <reference path="../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />
/// <reference path="../durandal/typings/durandal.d.ts"/>

import router = module("durandal/plugins/router");
import app = module("durandal/app");
import sys = module("durandal/system");

import database = module("models/database");
import raven = module("common/raven");

class shell {

    router = router; 
	databases = ko.observableArray<database>(); 
	activeDatabase = ko.observable<database>().subscribeTo("ActivateDatabase");
	ravenDb: raven;

	constructor() {
        this.ravenDb = new raven();
    }

    databasesLoaded(databases: database[]) {
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
}

export = shell; 