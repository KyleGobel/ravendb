/// <reference path="shell.ts" />
/// <reference path="../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />
/// <reference path="../durandal/typings/durandal.d.ts"/>

import http = module("durandal/http");
import app = module("durandal/app");
import database = module("models/database");
import raven = module("common/raven");

export class documents { 

	activeDatabase = null;
	displayName = "documents";
	ravenDb: raven;

	constructor() {
		this.ravenDb = new raven();
	}
	
	activate() {
		this.ravenDb
			.collections()
			.then(results => console.log("collections loaded!", results));
	}

    canDeactivate() {
        return true;
    } 
}