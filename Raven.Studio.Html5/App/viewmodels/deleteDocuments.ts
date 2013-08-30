import document = require("models/document");
import dialog = require("plugins/dialog");
import deleteDocumentsCommand = require("commands/deleteDocumentsCommand");

class deleteDocuments {

    private documents = ko.observableArray<document>();
    public deletionTask = $.Deferred(); // Gives consumers a way to know when the async delete operation completes.

    constructor(documents: Array<document>) {
        if (documents.length === 0) {
            throw new Error("Tried to launch delete dialog with zero docs.");
        }

        this.documents(documents);
    }

    deleteDocs() {
        var deletedItemIds = this.documents().map(i => i.getId());
        var deleteCommand = new deleteDocumentsCommand(deletedItemIds);
        var deleteCommandTask = deleteCommand.execute();
        deleteCommandTask.done(() => this.deletionTask.resolve(this.documents()));
        deleteCommandTask.fail(response => this.deletionTask.reject(response));
        dialog.close(this);
    }

    cancel() {
        dialog.close(this);
    }

    deactivate() {
        // If we were closed via X button or other dialog dismissal, reject the deletion task since
        // we never carried it out.
        if (this.deletionTask.state() === "pending") {
            this.deletionTask.reject();
        }
    }
}

export = deleteDocuments;