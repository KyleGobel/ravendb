var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "commands/commandBase", "common/alertType"], function(require, exports, __commandBase__, __alertType__) {
    var commandBase = __commandBase__;
    var alertType = __alertType__;

    var deleteDocumentsCommand = (function (_super) {
        __extends(deleteDocumentsCommand, _super);
        function deleteDocumentsCommand(docIds) {
            _super.call(this);
            this.docIds = docIds;
        }
        deleteDocumentsCommand.prototype.execute = function () {
            var _this = this;
            var deleteTask = this.ravenDb.deleteDocuments(this.docIds);

            var docCount = this.docIds.length;
            var alertInfoTitle = docCount > 1 ? "Deleting " + docCount + "docs..." : "Deleting " + this.docIds[0];
            this.reportProgress(alertType.info, alertInfoTitle);

            deleteTask.done(function () {
                return _this.reportProgress(alertType.success, "Deleted " + docCount + " docs");
            });
            deleteTask.fail(function (response) {
                return _this.reportProgress(alertType.danger, "Doc delete failed", JSON.stringify(response));
            });
            return deleteTask;
        };
        return deleteDocumentsCommand;
    })(commandBase);

    
    return deleteDocumentsCommand;
});
//# sourceMappingURL=deleteDocumentsCommand.js.map
