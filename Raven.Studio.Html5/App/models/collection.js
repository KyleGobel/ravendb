define(["require", "exports"], function(require, exports) {
    var collection = (function () {
        function collection(name) {
            this.name = name;
            this.colorClass = "";
            this.documentCount = ko.observable(0);
        }
        return collection;
    })();

    
    return collection;
});
