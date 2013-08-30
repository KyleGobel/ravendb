define(["require", "exports", "models/document", "plugins/dialog", "commands/deleteDocumentsCommand"], function(require, exports, __document__, __dialog__, __deleteDocumentsCommand__) {
    var document = __document__;
    var dialog = __dialog__;
    var deleteDocumentsCommand = __deleteDocumentsCommand__;

    var deleteDocuments = (function () {
        function deleteDocuments(documents) {
            this.documents = ko.observableArray();
            this.deletionTask = $.Deferred();
            if (documents.length === 0) {
                throw new Error("Tried to launch delete dialog with zero docs.");
            }

            this.documents(documents);
        }
        deleteDocuments.prototype.deleteDocs = function () {
            var _this = this;
            var deletedItemIds = this.documents().map(function (i) {
                return i.getId();
            });
            var deleteCommand = new deleteDocumentsCommand(deletedItemIds);
            var deleteCommandTask = deleteCommand.execute();
            deleteCommandTask.done(function () {
                return _this.deletionTask.resolve(_this.documents());
            });
            deleteCommandTask.fail(function (response) {
                return _this.deletionTask.reject(response);
            });
            dialog.close(this);
        };

        deleteDocuments.prototype.cancel = function () {
            dialog.close(this);
        };

        deleteDocuments.prototype.deactivate = function () {
            if (this.deletionTask.state() === "pending") {
                this.deletionTask.reject();
            }
        };
        return deleteDocuments;
    })();

    
    return deleteDocuments;
});
//# sourceMappingURL=deleteDocuments.js.map
