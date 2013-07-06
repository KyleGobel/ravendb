/// <reference path="promise.ts" />
/// <reference path="../../Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" /> 

import database = module("models/database");
import collection = module("models/collection"); 
import collectionInfo = module("models/collectionInfo");
import document = module("models/document");
import pagedResultSet = module("common/pagedResultSet");

class raven {

	// For testing purposes, our base URL.
	private baseUrl = "";
	
	public static activeDatabase = ko.observable<database>().subscribeTo("ActivateDatabase");

    public databases(): promise<database[]> {
		var resultsSelector = (databaseNames: string[]) => databaseNames.map(n => new database(n));
		return this.fetch("/databases", { pageSize: 1024 }, null, resultsSelector);		
    }

	public collections(): promise<collection[]> {
		this.requireActiveDatabase();

        var args = {
            field: "Tag",
            fromValue: "",
            pageSize: 100
		};
		var resultsSelector = (collectionNames: string[]) => collectionNames.map(n => new collection(n));
        return this.fetch("/terms/Raven/DocumentsByEntityName", args, raven.activeDatabase(), resultsSelector);
	}

	public collectionInfo(collectionName?: string, documentsSkip = 0, documentsTake = 0): promise<collectionInfo> {
		this.requireActiveDatabase();

		var args = {
			query: collectionName ? "Tag:" + collectionName : undefined,
			start: documentsSkip,
			pageSize: documentsTake
		};

		var resultsSelector = (dto: collectionInfoDto) => new collectionInfo(dto);
		var url = "/indexes/Raven/DocumentsByEntityName";
		return this.fetch(url, args, raven.activeDatabase(), resultsSelector);
	}

	// should return promise<pagedResultSet>, but TS compiler doesn't like this.
	public documents(collectionName: string, skip = 0, take = 30): promise<any> {
		this.requireActiveDatabase();

		var documentsTask = $.Deferred();
		this.collectionInfo(collectionName, skip, take)
			.then(collection => {
				var items = collection.results; 
				var resultSet = new pagedResultSet(items, collection.totalResults);
				documentsTask.resolve(resultSet);
			});
		return documentsTask;
	}

	private requireActiveDatabase(): void {
		if (!raven.activeDatabase()) {
			throw new Error("Must have an active database before calling this method.");
		}
	}

    private fetch(relativeUrl: string, args: any, database?: database, resultsSelector?: (results: any) => any): JQueryPromise {
        var ajax = $.ajax({
            cache: false,
            url: this.baseUrl + (database && database.isSystem === false ? "/databases/" + database.name : "") + relativeUrl,
            data: args
		});
		var foo: JQueryXHR = null;
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