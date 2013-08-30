import raven = require("common/raven");
import alertArgs = require("common/alertArgs");
import alertType = require("common/alertType");

class commandBase {
    ravenDb: raven;

    constructor() {
        this.ravenDb = new raven();
    }

    execute(): JQueryPromise<any> {
        throw new Error("Execute must be overridden.");
    }

    reportProgress(type: alertType, title: string, details?: string) {
        ko.postbox.publish("Alert", new alertArgs(type, title, details));
    }
}

export = commandBase;