/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../Scripts/typings/knockout/knockout.d.ts" />
/// <reference path="../../Scripts/extensions.ts" />
define(["require", "exports"], function(require, exports) {
    

    var pagedList = (function () {
        function pagedList(fetcher, take) {
            if (typeof take === "undefined") { take = 30; }
            this.fetcher = fetcher;
            this.take = take;
            this.isFetching = ko.observable(false);
            this.items = ko.observableArray();
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
                });
            }

            return null;
        };
        return pagedList;
    })();

    
    return pagedList;
});
//# sourceMappingURL=pagedList.js.map
