define(["require", "exports", "common/raven", "common/pagedList"], function(require, exports, __raven__, __pagedList__) {
    var raven = __raven__;
    var pagedList = __pagedList__;

    var collection = (function () {
        function collection(name) {
            this.name = name;
            this.colorClass = "";
            this.documentCount = ko.observable(0);
        }
        collection.prototype.activate = function () {
            ko.postbox.publish("ActivateCollection", this);
        };
        return collection;
    })();

    
    return collection;
});
//@ sourceMappingURL=collection.js.map
