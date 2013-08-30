import alertType = require("common/alertType");

class alertArgs {
    constructor(public type: alertType, public title: string, public details?: string) {
    }
}

export = alertArgs;