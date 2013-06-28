/// <reference path="../../Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="promise.ts" />
/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" /> 

import database = module("models/database");
import collection = module("models/database");

class raven {

	// For testing purposes, our base URL.
	private baseUrl = "http://localhost:8080";
	
	public static activeDatabase = ko.observable<database>().subscribeTo("ActivateDatabase");

    public databases(): Promise<database[]> {
		//var deferred = $.Deferred(); 
		//this
		//	.fetch("/databases", { pageSize: 1024 })
		//    .done((databaseNames: string[]) => {
		//        var databases = databaseNames.map(n => new database(n));
		//        deferred.resolve(databases);
		//    });
		//return deferred;

		var resultsSelector = (databaseNames: string[]) => databaseNames.map(n => new database(n));
		return this.fetch("/databases", { pageSize: 1024 }, null, resultsSelector);		
    }

	public collections(): Promise<collection[]> {
		this.requireActiveDatabase();

        var args = {
            field: "Tag",
            fromValue: "",
            pageSize: 100
		};
		var resultsSelector = (collectionNames: string[]) => collectionNames.map(n => new collection(n));
        return this.fetch("/terms/Raven/DocumentsByEntityName", args, raven.activeDatabase(), resultsSelector);
	}

	private requireActiveDatabase(): void {
		if (!raven.activeDatabase()) {
			throw new Error("Must have an active database before calling this method.");
		}
	}

    private fetch(relativeUrl: string, args: any, database?: database, resultsSelector?: (results: any) => any): JQueryPromise {
        var ajax = $.ajax({
            cache: false,
            url: this.baseUrl + (database ? "/databases/" + database.name : "") + relativeUrl,
            data: args
		});

		if (resultsSelector) {
			var task = $.Deferred();
			ajax.done((results) => {
				var transformedResults = resultsSelector(results);
				task.resolve(transformedResults);
			});
			return task;
		} else {
			return ajax;
		}
	}
}

export = raven;