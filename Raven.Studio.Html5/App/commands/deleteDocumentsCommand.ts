import commandBase = require("commands/commandBase");
import alertType = require("common/alertType");

class deleteDocumentsCommand extends commandBase {

    constructor(private docIds: Array<string>) {
        super();
    }

    execute(): JQueryPromise<any> {
        var deleteTask = this.ravenDb.deleteDocuments(this.docIds);

        var docCount = this.docIds.length;
        var alertInfoTitle = docCount > 1 ? "Deleting " + docCount + "docs..." : "Deleting " + this.docIds[0];
        this.reportProgress(alertType.info, alertInfoTitle);

        deleteTask.done(() => this.reportProgress(alertType.success, "Deleted " + docCount + " docs"));
        deleteTask.fail((response) => this.reportProgress(alertType.danger, "Doc delete failed", JSON.stringify(response)));
        return deleteTask;
    }
}

export = deleteDocumentsCommand;