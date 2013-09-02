/// <reference path="../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />
define(["require", "exports"], function(require, exports) {
    var database = (function () {
        function database(name) {
            this.name = name;
            this.isSystem = false;
            this.isSelected = ko.observable(false);
        }
        database.prototype.activate = function () {
            ko.postbox.publish("ActivateDatabase", this);
        };
        return database;
    })();

    
    return database;
});
//# sourceMappingURL=database.js.map
