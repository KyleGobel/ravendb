define(["require", "exports"], function(require, exports) {
    
    

    var collection = (function () {
        function collection(name) {
            this.name = name;
            this.colorClass = "";
            this.documentCount = ko.observable(0);
        }
        // Notifies consumers that this collection should be the selected one.
        // Called from the UI when a user clicks a collection the documents page.
        collection.prototype.activate = function () {
            ko.postbox.publish("ActivateCollection", this);
        };
        return collection;
    })();

    
    return collection;
});
//# sourceMappingURL=collection.js.map
