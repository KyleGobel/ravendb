define(["require", "exports", "models/database", "common/raven"], function(require, exports, __database__, __raven__) {
    
    
    var database = __database__;
    var raven = __raven__;

    var documents = (function () {
        function documents() {
            this.activeDatabase = null;
            this.displayName = "documents";
            this.ravenDb = new raven();
        }
        documents.prototype.activate = function () {
            this.ravenDb.collections().then(function (results) {
                return console.log("collections loaded!", results);
            });
        };

        documents.prototype.canDeactivate = function () {
            return true;
        };
        return documents;
    })();
    exports.documents = documents;
});
//@ sourceMappingURL=documents.js.map
