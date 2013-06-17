define(["require", "exports"], function(require, exports) {
    
    
    var documents = (function () {
        function documents() {
            this.displayName = "documents";
        }
        documents.prototype.activate = function () {
        };
        documents.prototype.canDeactivate = function () {
            return true;
        };
        return documents;
    })();
    exports.documents = documents;    
})
