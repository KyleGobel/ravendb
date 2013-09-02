import app = require("durandal/app");
import sys = require("durandal/system");
import router = require("plugins/router");

import raven = require("common/raven");
import database = require("models/database");

class databases {

    ravenDb: raven;
    databases = ko.observableArray<database>();

    constructor() {
        this.ravenDb = new raven();
    }

    activate(navigationArgs) {
        this.ravenDb
            .databases()
            .done((results: Array<database>) => this.databases(results));
    }

    navigateToDocuments(db: database) {
        db.activate();
        router.navigate("#documents?db=" + encodeURIComponent(db.name));
    }
}

export = databases;