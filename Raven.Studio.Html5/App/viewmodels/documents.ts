/// <reference path="shell.ts" />
/// <reference path="../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />
/// <reference path="../durandal/typings/durandal.d.ts"/>

import http = module("durandal/http");
import app = module("durandal/app");
import database = module("models/database");
import collection = module("models/collection");
import raven = module("common/raven");

export class documents { 

	displayName = "documents";
	ravenDb: raven;
    collections = ko.observableArray<collection>();
    selectedCollection = ko.observable<collection>().subscribeTo("ActivateCollection");
    collectionColors = []

	constructor() {
		this.ravenDb = new raven();
	}
	
	activate() {
		this.ravenDb
			.collections()
			.then(results => this.loadCollections(results));
    }

    loadCollections(collections: collection[]) {
        // Set the color class for each of the collections.
        // These styles are found in app.less.
        var collectionStyleCount = 7;
        collections.forEach((c, index) => c.colorClass = "collection-style-" + (index % collectionStyleCount));

        // Create the "All Documents" pseudo collection.
        var allDocuments = new collection("All Documents");
        allDocuments.colorClass = "all-documents-collection";
        <any>allDocuments.documentCount = ko.computed(() => this.collections()
            .filter(c => c !== allDocuments) // Don't include self, the all documents collection.
            .map(c => c.documentCount()) // Grab the document count of each.
            .reduce((first, second) => { return first + second }, 0)); // And sum them up.

        // All systems a-go.
        var allCollections = [allDocuments].concat(collections);
        this.collections(allCollections);
    }

    canDeactivate() {
        return true;
    } 
}