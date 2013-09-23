/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="../../Scripts/extensions.ts" />
define(["require", "exports", "common/pagedResultSet"], function(require, exports, __pagedResultSet__) {
    var pagedResultSet = __pagedResultSet__;

    var pagedList = (function () {
        function pagedList(fetcher, take) {
            if (typeof take === "undefined") { take = 30; }
            this.fetcher = fetcher;
            this.take = take;
            this.items = ko.observableArray();
            this.currentItemIndex = ko.observable(0);
            this.collectionName = "";
            this.totalResults = ko.observable(0);
            this.isFetching = ko.observable(false);
            this.hasMoreItems = true;
        }
        pagedList.prototype.loadNextChunk = function () {
            var _this = this;
            if (!this.isFetching()) {
                this.isFetching(true);
                return this.fetcher(this.items().length, this.take).always(function () {
                    return _this.isFetching(false);
                }).done(function (resultSet) {
                    _this.items.pushAll(resultSet.items);
                    _this.hasMoreItems = _this.items().length < resultSet.totalResultCount;
                    _this.totalResults(resultSet.totalResultCount);
                });
            }

            return null;
        };

        pagedList.prototype.getNthItem = function (nth) {
            var deferred = $.Deferred();
            this.fetcher(nth, 1).done(function (result) {
                return deferred.resolve(result.items[0]);
            }).fail(function (error) {
                return deferred.reject(error);
            });
            return deferred;
        };
        return pagedList;
    })();

    
    return pagedList;
});
//# sourceMappingURL=pagedList.js.map
