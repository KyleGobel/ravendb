/// <reference path="../../Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="promise.ts" />
/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" /> 

import database = module("models/database");

class raven {

	// For testing purposes, our base URL.
	private baseUrl = "http://localhost:8080";
	
	public static activeDatabase = ko.observable<database>().subscribeTo("ActivateDatabase");

    public databases(): Promise<database[]> {
        var deferred = $.Deferred(); 
		this
			.fetch("/databases", { pageSize: 1024 })
			.done(results => console.log("results!", results))
            .done((databaseNames: string[]) => {
                var databases = databaseNames.map(n => new database(n));
                deferred.resolve(databases);
            });
        return deferred;
    }

	public collections(): Promise<string[]> {
		this.requireActiveDatabase();

        var args = {
            field: "Tag",
            fromValue: "",
            pageSize: 100
        };
        return this.fetch("/terms/Raven/DocumentsByEntityName", args, raven.activeDatabase());
	}

	private requireActiveDatabase(): void {
		if (!raven.activeDatabase()) {
			throw new Error("Must have an active database before calling this method.");
		}
	}

    private fetch(relativeUrl: string, args: any, database?: database): JQueryPromise {
        return $.ajax({
            cache: false,
            url: this.baseUrl + (database ? "/databases/" + database.name : "") + relativeUrl,
            data: args
        });
	}
}

export = raven;