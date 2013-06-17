define(["require", "exports"], function(require, exports) {
    
    var deleteMe2 = (function () {
        function deleteMe2() {
            this.displayName = "delete me 2";
        }
        deleteMe2.prototype.activate = function () {
            return;
        };
        deleteMe2.prototype.canDeactivate = function () {
            return;
        };
        return deleteMe2;
    })();
    exports.deleteMe2 = deleteMe2;    
})
