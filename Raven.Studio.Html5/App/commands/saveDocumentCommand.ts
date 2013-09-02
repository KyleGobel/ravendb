import commandBase = require("commands/commandBase");
import document = require("models/document");

class saveDocumentCommand extends commandBase {

    constructor(private document: document) {
        super();
    }

    execute(): JQueryPromise<any> {
        var saveTask = this.ravenDb.saveDocument(this.document);

        this.reportInfo("Saving " + this.document.getId() + "...");

        saveTask.done(() => this.reportSuccess("Saved " + this.document.getId()));
        saveTask.fail((response) => this.reportError("Failed to save " + this.document.getId(), JSON.stringify(response)));
        return saveTask;
    }
}

export = saveDocumentCommand;