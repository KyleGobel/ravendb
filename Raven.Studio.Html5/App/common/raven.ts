/// <reference path="promise.ts" />
/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" /> 

import database = module("models/database");

class raven {

    // For testing purposes, our base URL.
    private baseUrl = "http://localhost:8080"; 
    
    public databases(): Promise<database[]> {
        var deferred = $.Deferred();
        this
            .fetch("/databases", { pageSize: 1024 })
            .done((databaseNames: string[]) => {
                var databases = databaseNames.map(n => new database(n));
                deferred.resolve(databases);
            });
        return deferred;
    }

    public collections(database: database): Promise<string[]> {
        var args = {
            field: "Tag",
            fromValue: "",
            pageSize: 100
        };
        return this.fetch("/terms/Raven/DocumentsByEntityName", args, database);
    }

    private fetch(relativeUrl: string, args: any, database?: database): JQueryPromise {
        return $.ajax({
            cache: false,
            url: this.baseUrl + (database ? "/" + database.name : "") + relativeUrl,
            data: args
        });
    }
}
export = raven;