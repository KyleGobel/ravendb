var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "commands/commandBase", "models/document"], function(require, exports, __commandBase__, __document__) {
    var commandBase = __commandBase__;
    var document = __document__;

    var saveDocumentCommand = (function (_super) {
        __extends(saveDocumentCommand, _super);
        function saveDocumentCommand(document) {
            _super.call(this);
            this.document = document;
        }
        saveDocumentCommand.prototype.execute = function () {
            var _this = this;
            var saveTask = this.ravenDb.saveDocument(this.document);

            this.reportInfo("Saving " + this.document.getId() + "...");

            saveTask.done(function () {
                return _this.reportSuccess("Saved " + _this.document.getId());
            });
            saveTask.fail(function (response) {
                return _this.reportError("Failed to save " + _this.document.getId(), JSON.stringify(response));
            });
            return saveTask;
        };
        return saveDocumentCommand;
    })(commandBase);

    
    return saveDocumentCommand;
});
//# sourceMappingURL=saveDocumentCommand.js.map
