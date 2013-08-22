/// <reference path="shell.ts" />
/// <reference path="../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />
/// <reference path="../../Scripts/typings/bootstrap/bootstrap.d.ts" />
/// <reference path="../durandal/typings/durandal.d.ts"/>

import http = require("durandal/http");
import app = require("durandal/app");
import sys = require("durandal/system");
import router = require("durandal/plugins/router");

import database = require("models/database");
import collection = require("models/collection");
import document = require("models/document");

import raven = require("common/raven");
import pagedList = require("common/pagedList");

class documents {

    displayName = "documents";
    ravenDb: raven;
    collections = ko.observableArray<collection>();
    selectedCollection = ko.observable<collection>().subscribeTo("ActivateCollection");
    allDocumentsCollection: collection;
    collectionColors = []
    collectionsLoadedTask = $.Deferred();
    collectionDocumentsLoaded = 0;
    collectionToSelectName: string;
    private currentCollectionPagedItems = ko.observable<pagedList>();
    itemsToDelete = ko.observableArray<document>();
    deleteCallback: Function;

    constructor() {
        this.ravenDb = new raven();
        this.ravenDb
            .collections()
            .then(results => this.collectionsLoaded(results));

        this.selectedCollection.subscribe(c => this.onSelectedCollectionChanged(c));
        ko.postbox.subscribe("EditDocument", args => router.navigateTo("#edit?id=" + encodeURIComponent(args.item.getId())));
    }

    collectionsLoaded(collections: Array<collection>) {
        // Set the color class for each of the collections.
        // These styles are found in app.less.
        var collectionStyleCount = 7;
        collections.forEach((c, index) => c.colorClass = "collection-style-" + (index % collectionStyleCount));

        // Create the "All Documents" pseudo collection.
        this.allDocumentsCollection = new collection("All Documents");
        this.allDocumentsCollection.colorClass = "all-documents-collection";
        <any>this.allDocumentsCollection.documentCount = ko.computed(() =>
            this.collections()
                .filter(c => c !== this.allDocumentsCollection) // Don't include self, the all documents collection.
                .map(c => c.documentCount()) // Grab the document count of each.
                .reduce((first, second) => first + second, 0)); // And sum them up.

        // All systems a-go. Load them into the UI and select the first one.
        var allCollections = [this.allDocumentsCollection].concat(collections);
        this.collections(allCollections);

        var collectionToSelect = collections.filter(c => c.name === this.collectionToSelectName)[0] || this.allDocumentsCollection;
        collectionToSelect.activate();

        // Fetch the collection info for each collection.
        // The collection info contains information such as total number of documents.
        collections.forEach(c => this.fetchTotalDocuments(c));

        // Listen for when the grid deletes the item 
        ko.postbox.subscribe("DeleteItems", items => this.showDeletePrompt(items));
    }

    fetchTotalDocuments(collection: collection) {
        this.ravenDb
            .collectionInfo(collection.name)
            .then(info => {
                collection.documentCount(info.totalResults);
                this.collectionDocumentsLoaded++;
                if (this.collectionDocumentsLoaded === this.collections().length - 1) {
                    this.collectionsLoadedTask.resolve();
                }
            });
    }

    onSelectedCollectionChanged(selected: collection) {
        if (collection) {
            var fetcher = (skip: number, take: number) => {
                var collectionName = selected !== this.allDocumentsCollection ? selected.name : null;
                return this.ravenDb.documents(collectionName, skip, take);
            };

            var documentsList = new pagedList(fetcher, 30)
			this.currentCollectionPagedItems(documentsList);
        }
    }

    activate(args) {
        // We can optionally pass in a collection name to view's URL, e.g. #/documents?collection=Foo/123
        this.collectionToSelectName = args.collection;
        return this.collectionsLoadedTask;
    }

    showDeletePrompt(args: { items: Array<document>; callback: () => void }) {
        this.deleteCallback = args.callback;
        this.itemsToDelete(args.items);
        $('#DeleteDocumentsConfirmation').modal({
            backdrop: true,
            show: true
        });
    }

    confirmDelete() {
        if (this.deleteCallback && this.itemsToDelete().length > 0) {
            var deletedItemIds = this.itemsToDelete().map(i => i.__metadata.id);
            var deleteTask = this.ravenDb.deleteDocuments(deletedItemIds);
            deleteTask.done(() => {
                this.deleteCallback();
            });
            deleteTask.fail((response) => {
                sys.log("Failed to delete items", response);
                app.showMessage("An error occurred deleting the item(s). Details in the browser console.", ":-(");
            });
        }
    }
}

export = documents;