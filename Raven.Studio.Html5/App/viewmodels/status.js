define(["require", "exports"], function(require, exports) {
    var status = (function () {
        function status() {
            this.displayName = "status";
        }
        status.prototype.activate = function () {
        };
        status.prototype.canDeactivate = function () {
            return true;
        };
        return status;
    })();
    exports.status = status;
});
//# sourceMappingURL=status.js.map
