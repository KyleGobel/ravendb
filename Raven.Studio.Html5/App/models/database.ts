/// <reference path="../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />

class database {
    isSystem = false;
    isSelected = ko.observable(false);

    constructor(public name: string) {
    }

	activate() {
		ko.postbox.publish("ActivateDatabase", this);
	}
}

export = database; 