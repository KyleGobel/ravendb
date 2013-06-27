/// <reference path="../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />

class database {
    constructor(public name: string) {
	}

	activate() {
		ko.postbox.publish("ActivateDatabase", this);
	}
}

export = database;