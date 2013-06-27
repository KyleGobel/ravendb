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
    }

    databasesLoaded(databases: database[]) {
		this.databases(databases);
		this.databases()[0].activate();
    }

    search() {
        app.showMessage('Search not yet implemented...');
    }

	activate() {

		// Activate the first page only after we've connected to Raven
		// and selected the first database.
		return this.ravenDb
			.databases()
			.then(results => this.databasesLoaded(results))
			.then(() => router.activate('documents'));
    }
}

export = shell;