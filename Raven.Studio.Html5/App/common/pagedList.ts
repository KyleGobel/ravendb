/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="../../Scripts/extensions.ts" />

import pagedResultSet = require("common/pagedResultSet");

class pagedList { 
	
	items = ko.observableArray<any>();
    currentItemIndex = ko.observable(0);
    collectionName = "";
    totalResults = ko.observable(0);
    isFetching = ko.observable(false);

    private hasMoreItems = true;

	constructor(private fetcher: (skip: number, take: number) => JQueryPromise<pagedResultSet>, private take = 30) {
	}

	loadNextChunk(): JQueryPromise<any> {
		if (!this.isFetching()) {
			this.isFetching(true);
			return this.fetcher(this.items().length, this.take)
				.always(() => this.isFetching(false))
				.done(resultSet => {
					this.items.pushAll(resultSet.items);
                    this.hasMoreItems = this.items().length < resultSet.totalResultCount;
                    this.totalResults(resultSet.totalResultCount);
				});
		}

		return null;
    }

    getNthItem(nth: number): JQueryPromise<any> {
        var deferred = $.Deferred();
        this.fetcher(nth, 1)
            .done((result: pagedResultSet) => deferred.resolve(result.items[0]))
            .fail(error => deferred.reject(error));
        return deferred;
    }
}

export = pagedList;