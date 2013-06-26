///<reference path="../durandal/typings/durandal.d.ts"/>
import router = module("durandal/plugins/router");
import app = module("durandal/app");
import database = module("models/database");
import raven = module("common/raven");

class shell {

    router = router;
    databases = ko.observableArray<database>();
    activeDatabase = ko.observable<database>();
    ravenDb: raven;

    constructor() {
        this.ravenDb = new raven();
        this.ravenDb.databases().then(databases => this.databasesLoaded(databases));
    }

    databasesLoaded(databases: database[]) {
        this.databases(databases);
        if (databases.length > 0) {
            this.activeDatabase(databases[0]);
        }
    }

    search() {
        app.showMessage('Search not yet implemented...');
    }

    activate() {
        return router.activate('documents');
    }
}
export = shell; 

//new shell();