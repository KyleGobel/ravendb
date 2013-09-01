import document = require("models/document");
import dialog = require("plugins/dialog");
import deleteCollectionCommand = require("commands/deleteCollectionCommand");
import collection = require("models/collection");

class deleteCollection {

    public deletionTask = $.Deferred();

    constructor(private collection: collection) {
    }

    deleteCollection() {
        var deleteCommand = new deleteCollectionCommand(this.collection.name);
        var deleteCommandTask = deleteCommand.execute();
        deleteCommandTask.done(() => this.deletionTask.resolve(this.collection));
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

export = deleteCollection;