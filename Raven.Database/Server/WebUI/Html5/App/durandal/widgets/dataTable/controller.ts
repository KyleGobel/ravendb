///<reference path="../../typings/durandal.d.ts"/>
///<reference path="../../../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />
///<reference path="../../../../Scripts/extensions.ts"/>

import widget = module("durandal/widget");
import pagedList = module("common/pagedList");
import document = module("models/document");
import pagedResultSet = module("common/pagedResultSet"); 

interface cell {
    templateName: string;
    value: any;
}

interface row {
	isChecked: KnockoutObservable<bool>;
	cells: KnockoutObservableArray<cell>;
	data: any;
}

// Durandal.js configuration requires that exported widgets be named ctor.
class ctor {

    rows = ko.observableArray();
    columns = ko.observableArray();
	isLoading: KnockoutComputed<boolean>;
    allRowsChecked: KnockoutComputed<boolean>;
    private selectionStack: row[] = [];
	isFirstRender = true;
	skip = 0;
	take = 100;
	totalRowsCount = 0;
	private currentItemsCollection = ko.observable<pagedList>();

    constructor(private element: HTMLElement, private settings) {
		
		if (!settings.items || !ko.isObservable(settings.items)) {
			throw new Error("datatable must be passed an items observable.");
		}

		this.currentItemsCollection = this.settings.items;
		this.fetchNextChunk();
		
		// Computeds
		this.allRowsChecked = ko.computed({
            read: () => this.rows().length > 0 && this.rows().every(r => r.isChecked()),
            write: (val) => this.rows().forEach(r => r.isChecked(val))
		});
		this.isLoading = ko.computed(() => this.currentItemsCollection() && this.currentItemsCollection().isFetching());
		
		// Subscriptions
		this.currentItemsCollection.subscribe(() => {
            this.rows.removeAll();
            this.columns.removeAll();
			this.fetchNextChunk();
		});
		if (this.currentItemsCollection()) {
			this.fetchNextChunk();
		}

		// Size the table to full height whenever the page height changes.
		$(window).resize(() => this.sizeTable());
    }

    sizeTable() { 
		var tableElement = $(this.element).find(".datatable");
		var footer = $("footer");
		if (tableElement && footer) {
			var tablePosition = tableElement.position();
			var footerPosition = footer.position();
			if (tablePosition && footerPosition) {
				var bottomPadding = 70;
				tableElement.height(footerPosition.top - tablePosition.top - bottomPadding);
			}
        }
    }

    fetchNextChunk() {
		var collection = this.currentItemsCollection();
		if (collection) {
			var nextChunkPromiseOrNull = collection.loadNextChunk();
			if (nextChunkPromiseOrNull) {
				nextChunkPromiseOrNull.done(results => this.nextChunkFetched(results));
			}
		}
    }

    private nextChunkFetched(results: pagedResultSet) {
        this.totalRowsCount = results.totalResultCount;

        this.createCellsForColumns(this.rows(), this.getPropertyNames(results.items));

        var rows: row[] = results.items
            .map(row => {
                var cells = this
                    .columns()
                    .map(c => this.createCell(this.getTemplateForCell(c, row), c, row, row[c]));

                return this.createRow(row, ko.observableArray(cells));
			});

		this.rows.pushAll(rows);
            
        //this.streamInRows(rows, () => {
        //    this.skip += results.items.length;
        //    this.isLoading(false);
        //});
    }

    getPropertyNames(objects: any[]): string[] {
        var propertyNames: string[] = [];
        objects.forEach(f => {
            for (var property in f) {
                if (f.hasOwnProperty(property) && property !== '__metadata' && propertyNames.indexOf(property) == -1) {
                    propertyNames.push(property);
                }
            }
        });
        return propertyNames;
    }

    private createCellsForColumns(rows: row[], columns: string[]) {

        var newColumns = columns
            .filter(c => this.columns().indexOf(c) === -1 && c !== "Id") // Ignore the Id column, since we pull that from the metadata.
            .sort((a, b) => { 
                // Prefer 'Name' before others.
                if (a === "Name") return -1;
                if (b === "Name") return 1;
                if (a) return a.localeCompare(b);
                if (b) return b.localeCompare(a);
                return 0;
            }); 

        if (this.columns().length === 0) {
            newColumns.unshift("Id");
        }

        if (newColumns.length > 0) {
            var createNewCells = row => newColumns.map(c => this.createCell("default-cell-template", c, row, ""));
            this.columns.pushAll(newColumns);

            rows.forEach(r => r.cells.pushAll(createNewCells(r)));
        }
    }

    private toggleChecked(row: row, e: any) {
        row.isChecked(!row.isChecked());
        var rowIndex = this.rows.indexOf(row);
        if (row.isChecked()) {
            this.selectionStack.unshift(row);
        } else {
            var indexOfRemovedItem = this.selectionStack.indexOf(row);
            if (indexOfRemovedItem >= 0) {
                this.selectionStack.splice(indexOfRemovedItem, 1);
            }
        }

        // If the shift key was pressed, we want to select/deselect
        // everything between the row and the previous selected row.
        if (e && e.shiftKey && this.selectionStack.length > 1) {
            var newSelectionState = row.isChecked();
            var previousSelectionIndex = this.rows.indexOf(newSelectionState ? this.selectionStack[1] : this.selectionStack[0]);
            var validIndices = rowIndex >= 0 && previousSelectionIndex >= 0 && rowIndex != previousSelectionIndex;
            if (validIndices) {
                this.rows
                    .slice(Math.min(rowIndex, previousSelectionIndex), Math.max(rowIndex, previousSelectionIndex))
                    .forEach((r: row) => r.isChecked(newSelectionState));
            }
        }
    }

    getTemplateForCell(columnName: string, row: any) {
        if (columnName == "Id") {
            return "colored-id-cell-template";
        }
        if (row[columnName]) {
            var matches = row[columnName].toString().match(/\w+\/\d+/);
            var looksLikeId = matches && matches[0] == row[columnName];
            if (looksLikeId) {
                return "id-cell-template";
            }
        }

        return "default-cell-template";
    }

    toggleAllRowsChecked() {
        this.allRowsChecked(!this.allRowsChecked());
    }

	loadMoreIfNeeded() {
        if (!this.isLoading() && this.rows().length < this.totalRowsCount) {
			var table = $(this.element);
            var tableBottom = table.position().top + table.height();
            var lastRowPos = $(this.element).find(".document-row:last-child").position();
            var nearPadding = 200;
            var lastRowIsVisible = lastRowPos && (lastRowPos.top - nearPadding) < tableBottom;
            if (lastRowIsVisible) {
                this.fetchNextChunk();
            }
        }
    }

    afterRenderColumn() {
        if (this.isFirstRender) {
            var dataTable = $(this.element).find(".datatable");
            if (dataTable != null) {
                this.isFirstRender = false;
                this.sizeTable();
                dataTable.scroll(() => this.loadMoreIfNeeded());
            }
        }
    }

    private createRow(rowData: any, cells: KnockoutObservableArray<cell>): row {
        return {
			data: rowData,
            cells: cells,
            isChecked: ko.observable(false)
        }
    }

    private createCell(templateName: string, columnName: string, rowData: any, value: any): cell {
        
        // If it's the ID column, and we don't have a value, pull the ID
        // from the document metadata.
        if (columnName === "Id" && !value && rowData && !rowData["Id"] && rowData.__metadata) {
            value = rowData.__metadata.id;
        }

        // If it's an object, give us the JSON string.
        if (value && typeof (value) == "object") {
            value = ko.toJSON(value);
        }
        
        var cell = {
            colorClass: "",
            templateName: templateName,
            value: value
        }
        
        if (columnName === "Id") {
            var args = {
                colorClass: "",
                item: rowData
            };
            ko.postbox.publish("RequestCollectionMembershipColorClass", args);
            cell.colorClass = args.colorClass;
        }

        return cell;
    }
}

export = ctor;