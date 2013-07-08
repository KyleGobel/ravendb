/// <reference path="../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />
/// <reference path="../durandal/typings/durandal.d.ts"/>

import router = module("durandal/plugins/router");
import app = module("durandal/app");
import database = module("models/database");
import raven = module("common/raven");

class shell {

    router = router; 
	databases = ko.observableArray<database>(); 
	activeDatabase = ko.observable<database>().subscribeTo("ActivateDatabase");
	ravenDb: raven;

	constructor() {
        this.ravenDb = new raven();

        ko.postbox.subscribe("RavenError", errorMessage => this.onRavenError(errorMessage));
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
			.then(results => this.databasesLoaded(results))
			.then(() => router.activate('documents'));
    }

    onRavenError(errorMessage: string) {
        app.showMessage(errorMessage, "RavenDb error");
    }
}

export = shell; 