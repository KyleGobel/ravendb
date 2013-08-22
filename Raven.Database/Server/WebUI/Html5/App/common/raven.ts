/// <reference path="promise.ts" />
/// <reference path="../../Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" /> 


import database = require("models/database");
import collection = require("models/collection"); 
import collectionInfo = require("models/collectionInfo");
import document = require("models/document");
import pagedResultSet = require("common/pagedResultSet");

class raven {

    private baseUrl = "http://localhost:8080"; // For debugging purposes, uncomment this line to point Raven at an already-running Raven server. Requires the Raven server to have it's config set to <add key="Raven/AccessControlAllowOrigin" value="*" />
	//private baseUrl = ""; // This should be used when serving HTML5 Studio from the server app.
	
	public static activeDatabase = ko.observable<database>().subscribeTo("ActivateDatabase");

    public databases(): JQueryPromise { // : promise<database[]>
		var resultsSelector = (databaseNames: string[]) => databaseNames.map(n => new database(n));
		return this.fetch("/databases", { pageSize: 1024 }, null, resultsSelector);		
    }

    public collections(): JQueryPromise { // : promise<database[]>
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

    public document(id: string): promise<document> {
        var resultsSelector = (dto: documentDto) => new document(dto);
        var url = "/docs/" + encodeURIComponent(id);
        return this.fetch(url, null, raven.activeDatabase(), resultsSelector);
    }

    public documentWithMetadata(id: string): promise<document> {
        var resultsSelector = (dtoResults: documentDto[]) => new document(dtoResults[0]);
		return this.docsById<document>(id, 0, 1, false, resultsSelector);
	}

	public searchIds(searchTerm: string, start: number, pageSize: number, metadataOnly: boolean) {
		var resultsSelector = (dtoResults: documentDto[]) => dtoResults.map(dto => new document(dto));
		return this.docsById<Array<document>>(searchTerm, start, pageSize, metadataOnly, resultsSelector);
	}

    public deleteDocuments(ids: string[]): promise {
        var deleteDocs = ids.map(id => this.createDeleteDocument(id));
        return this.post("/bulk_docs", ko.toJSON(deleteDocs), raven.activeDatabase());
	}

	public saveDocument(doc: document): promise {
		var customHeaders = {
			'Raven-Client-Version': '2.5.0.0',
			'Raven-Entity-Name': doc.__metadata.ravenEntityName,
			'Raven-Clr-Type': doc.__metadata.ravenClrType,
			'If-None-Match': doc.__metadata.etag
		};
		var args = JSON.stringify(doc.toDto());
		var url = "/docs/" + doc.__metadata.id;
		return this.put(url, args, raven.activeDatabase(), customHeaders);
	}

	public getBaseUrl() {
		return this.baseUrl;
	}

	public getDatabaseUrl() {
		var database = raven.activeDatabase();
		if (database) {
			return this.baseUrl + (database && database.isSystem === false ? "/databases/" + database.name : "");
		}

		return this.baseUrl;
	}

	private docsById<T>(idOrPartialId: string, start: number, pageSize: number, metadataOnly: boolean, resultsSelector): promise<T> {

		var url = "/docs/";
		var args = {
			startsWith: idOrPartialId,
			start: start,
			pageSize: pageSize
		};
		return this.fetch(url, args, raven.activeDatabase(), resultsSelector);
	}

    private createDeleteDocument(id: string) {
        return {
            Key: id,
            Method: "DELETE",
            Etag: null,
            AdditionalData: null
        }
    }    

	private requireActiveDatabase(): void {
		if (!raven.activeDatabase()) {
			throw new Error("Must have an active database before calling this method.");
		}
	}

    private fetch(relativeUrl: string, args: any, database?: database, resultsSelector?: (results: any) => any): JQueryPromise {
        var ajax = this.ajax(relativeUrl, args, "GET", database);

		var foo: JQueryXHR = null;
		if (resultsSelector) {
			var task = $.Deferred();
			ajax.done((results) => {
				var transformedResults = resultsSelector(results);
				task.resolve(transformedResults);
            });
            ajax.fail((request, status, error) => task.reject(request, status, error));
			return task;
		} else {
			return ajax; 
		}
    }

    private post(relativeUrl: string, args: any, database?: database, customHeaders?: any): JQueryPromise {
        return this.ajax(relativeUrl, args, "POST", database, customHeaders);
	}

	private put(relativeUrl: string, args: any, database?: database, customHeaders?: any): JQueryPromise {
		return this.ajax(relativeUrl, args, "PUT", database, customHeaders);
	}

    private ajax(relativeUrl: string, args: any, method: string, database?: database, customHeaders?: any): JQueryPromise {
        
        var options = {
            cache: false,
            url: this.getDatabaseUrl() + relativeUrl,
            data: args,
			type: method,
			beforeSend: undefined
        };

        if (customHeaders) {
			options.beforeSend = function (jqXHR, settings) {
				for (var prop in customHeaders) {
					options[prop] = customHeaders[prop];
					jqXHR.setRequestHeader(prop, options[prop]);
				}
			}
        }
        
        return $.ajax(options);
    }
}

export = raven;