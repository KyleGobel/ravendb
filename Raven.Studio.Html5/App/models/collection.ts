/// <reference path="../../Scripts/knockout-observableExtensions.ts" />

import raven = module("common/raven");
import pagedList = module("common/pagedList");

class collection {

    colorClass = ""; 
	documentCount = ko.observable(0);

	constructor(public name: string) {
	}

	// Notifies consumers that this collection should be the selected one.
	// Called from the UI when a user clicks a collection the documents page.
	activate() {
		ko.postbox.publish("ActivateCollection", this);
	}

}

export = collection;