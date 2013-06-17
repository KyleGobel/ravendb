define(["require", "exports"], function(require, exports) {
    
    
    var staus = (function () {
        function staus() {
            this.displayName = "status";
        }
        staus.prototype.activate = function () {
        };
        staus.prototype.canDeactivate = function () {
            return true;
        };
        return staus;
    })();
    exports.staus = staus;    
})
