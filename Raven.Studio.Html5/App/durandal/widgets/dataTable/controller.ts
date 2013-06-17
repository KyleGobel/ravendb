///<reference path="../../typings/durandal.d.ts"/>
///<reference path="../../../../Scripts/knockout-observableExtensions.ts"/>

import widget = module("durandal/widget");

export class Row { 
    public isChecked = ko.observable(false);
    constructor(public cells: KnockoutObservableArray) {
    }
}

export class Cell {
    constructor(public templateName: string, public value: any) {
    }
}

export class ctor {

    rows = ko.observableArray();
    columns = ko.observableArray();
    skip = 0;
    take = 100;
    totalRowsCount = 0;
    isLoading = ko.observable(false);
    allRowsChecked: KnockoutComputed;
    selectionStack: Row[] = [];
    isFirstRender = true;

    constructor(private element: HTMLElement, private settings) {
        this.fetchNextChunk();
        
        this.allRowsChecked = ko.computed({
            read: () => this.rows().length > 0 && this.rows().every(r => r.isChecked()),
            write: (val) => this.rows().forEach(r => r.isChecked(val))
        }); 

        // Size the table to full height whenever the page height changes.
        $(window).resize(() => this.sizeTable());
    }

    sizeTable() { 
        var tableElement = $(this.element).find(".datatable");
        if (tableElement) {
            var footerTop = $("footer").position().top;
            var tableTop = tableElement.position().top;
            var bottomPadding = 80;
            tableElement.height(footerTop - tableTop - bottomPadding);
        }
    }

    fetchNextChunk() {
        if (this.isLoading()) {
            return;
        }
            
        this.isLoading(true);
        var results = this.createDummyResults();
        setTimeout(() => this.nextChunkFetched({ Items: results, TotalItems: 342 } ), Math.random() * 1000);
    }

    nextChunkFetched(results) {
        this.totalRowsCount = results.TotalItems;

        this.createCellsForColumns(this.rows(), this.getPropertyNames(results.Items));

        var rows: Row[] = results.Items
            .map(row => {
                var cells = this
                    .columns()
                    .map(c => new Cell(this.getTemplateForCell(c, row), row[c]));
                return new Row(ko.observableArray(cells));
            });
              
        this.streamInRows(rows, () => {
            this.skip += results.Items.length;
            this.isLoading(false);
        });
    }

    getPropertyNames(objects: any[]): string[] {
        var propertyNames: string[] = [];
        objects.forEach(f => {
            for (var property in f) {
                if (propertyNames.indexOf(property) == -1) {
                    propertyNames.push(property);
                }
            }
        });
        return propertyNames;
    }

    createCellsForColumns(rows: Row[], columns: string[]) {
            
        var columnCount = this.columns().length;
        var newColumns = columns.filter(c => this.columns().indexOf(c) === -1);
            
        if (newColumns.length > 0) {
            var createCells = () => newColumns.map(c => new Cell("default-cell-template", ""));
            this.columns.pushAll(newColumns);
            rows.forEach(r => r.cells.pushAll(createCells()));
        }
    }

    toggleChecked(row, e) {            
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
                    .forEach((r: Row) => r.isChecked(newSelectionState));
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
            var nearPadding = 400;
            var lastRowIsVisible = lastRowPos && (lastRowPos.top - nearPadding) < tableBottom;
            if (lastRowIsVisible) {
                this.fetchNextChunk();
            }    
        }
    }

    streamInRows(rowsToAdd: Row[], doneCallback: () => void) {
        var chunkSize = 5;
        var removedRows = rowsToAdd.splice(0, chunkSize);
        this.rows.pushAll(removedRows);
        if (rowsToAdd.length > 0) {
            setTimeout(() => this.streamInRows(rowsToAdd, doneCallback), 1);
        }
        else {
            doneCallback();
        }
    }

    createDummyResults() {
        // Temporary: create a bunch of objects. 
        // Pretend we get them back from the server.
        var results = [];
        for (var i = 0; i < this.take; i++) {
            var random = Math.random();
            var item = null;
            if (random < .2) {
                item = {
                    Id: "likes/" + (i + 1),
                    LikeStatus: random < .1 ? "Like" : "Dislike",
                    Date: "2013-01-22T23:29:03.1445000",
                    SongId: "songs/" + (i + 5),
                    UserId: "users/" + (i + 42)
                }
            }
            else if (random < .4) {
                item = {
                    Id: "songs/" + (i + 1),
                    FileName: "aasdfasdf dwe",
                    Name: "Habedesharie",
                    Album: "Some Rand Album",
                    AlbumArtUri: null,
                    Artist: "The Beatles",
                    CommunityRank: Math.floor(100 * random)
                }
            }
            else if (random < .6) {
                item = {
                    Id: "visits/" + (i + 1),
                    DateTime: "2013-01-22T23:29:03.1445000",
                    TotalPlays: Math.floor(random * 100),
                    UserId: "users/" + (i + 1)
                }
            }
            else if (random < .8) {
                item = {
                    Id: "users/" + (i + 1),
                    ClientIdentifier: i + "2013-01-22T23:29:03.1445000",
                    Preferences: "fasdf asdf asdfeqwerasdf eqwefasdfasdf",
                    TotalPlays: Math.floor(random * 1000)
                }
            }
            else {
                item = {
                    Id: "logs/" + i,
                    Message: i + "qehqwet q asdfeqweerasdf eqwefasdfasdf",
                    TimeStamp: "2013-01-22T23:29:03.1445000",
                }
            }
            results.push(item);
        }

        return results;
    }

    afterRenderColumn() {
        if (this.isFirstRender) {
            var dataTable = $(this.element).find(".datatable");
            if (dataTable != null) {
                console.log("found datatable. Sizing.");
                this.isFirstRender = false;
                this.sizeTable();
                dataTable.scroll(() => this.loadMoreIfNeeded());
            }
        }
    }
}

