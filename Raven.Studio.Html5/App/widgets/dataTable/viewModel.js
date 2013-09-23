/// <reference path="../../../Scripts/extensions.ts" />
/// <reference path="../../../Scripts/typings/knockout.postbox/knockout-postbox.d.ts" />
/// <reference path="../../../Scripts/typings/durandal/durandal.d.ts" />
define(["require", "exports", "common/pagedList", "models/document", "models/collection", "common/pagedResultSet", "viewmodels/deleteDocuments", "viewmodels/copyDocuments", "durandal/app"], function(require, exports, __pagedList__, __document__, __collection__, __pagedResultSet__, __deleteDocuments__, __copyDocuments__, __app__) {
    
    var pagedList = __pagedList__;
    var document = __document__;
    var collection = __collection__;
    var pagedResultSet = __pagedResultSet__;
    var deleteDocuments = __deleteDocuments__;
    var copyDocuments = __copyDocuments__;
    var app = __app__;

    // Durandal.js configuration requires that exported widgets be named ctor.
    var ctor = (function () {
        function ctor() {
            this.rows = ko.observableArray();
            this.columns = ko.observableArray();
            this.isFirstRender = true;
            this.skip = 0;
            this.take = 100;
            this.totalRowsCount = 0;
            this.isContextMenuVisible = ko.observable(false);
            this.contextMenuX = ko.observable(0);
            this.contextMenuY = ko.observable(0);
        }
        ctor.prototype.activate = function (settings) {
            var _this = this;
            this.settings = settings;
            if (!settings.items || !ko.isObservable(settings.items)) {
                throw new Error("datatable must be passed an items observable.");
            }

            this.currentItemsCollection = this.settings.items;
            this.collections = this.settings.collections;
            this.selectionStack = [];
            this.memoizedColorClassForEntityName = this.getColorClassFromEntityName.memoize(this);
            this.fetchNextChunk();

            // Computeds
            this.allRowsChecked = ko.computed({
                read: function () {
                    return _this.rows().length > 0 && _this.rows().every(function (r) {
                        return r.isChecked();
                    });
                },
                write: function (val) {
                    return _this.rows().forEach(function (r) {
                        return r.isChecked(val);
                    });
                }
            });
            this.isLoading = ko.computed(function () {
                return _this.currentItemsCollection() && _this.currentItemsCollection().isFetching();
            });

            // Subscriptions
            this.currentItemsCollection.subscribe(function () {
                _this.rows.removeAll();
                _this.columns.removeAll();
                _this.fetchNextChunk();
                _this.selectionStack.length = 0;
            });

            if (this.currentItemsCollection()) {
                this.fetchNextChunk();
            }

            // Initialize the context menu (using Bootstrap-ContextMenu library).
            // TypeScript doesn't know about Bootstrap-Context menu, so we cast jQuery as any.
            ($('.datatable tbody')).contextmenu({ 'target': '#documents-grid-context-menu' });
        };

        ctor.prototype.fetchNextChunk = function () {
            var _this = this;
            var collection = this.currentItemsCollection();
            if (collection) {
                var nextChunkPromiseOrNull = collection.loadNextChunk();
                if (nextChunkPromiseOrNull) {
                    nextChunkPromiseOrNull.done(function (results) {
                        return _this.nextChunkFetched(results);
                    });
                }
            }
        };

        ctor.prototype.nextChunkFetched = function (results) {
            var _this = this;
            this.totalRowsCount = results.totalResultCount;

            this.createCellsForColumns(this.rows(), this.getPropertyNames(results.items));

            var rows = results.items.map(function (row) {
                var cells = _this.columns().map(function (c) {
                    return _this.createCell(_this.getTemplateForCell(c, row), c, row, row[c]);
                });

                return _this.createRow(row, ko.observableArray(cells));
            });

            this.rows.pushAll(rows);
        };

        ctor.prototype.getPropertyNames = function (objects) {
            var propertyNames = [];
            objects.forEach(function (f) {
                for (var property in f) {
                    if (f.hasOwnProperty(property) && property !== '__metadata' && propertyNames.indexOf(property) == -1) {
                        propertyNames.push(property);
                    }
                }
            });
            return propertyNames;
        };

        ctor.prototype.createCellsForColumns = function (rows, columns) {
            var _this = this;
            var newColumns = columns.filter(function (c) {
                return _this.columns().indexOf(c) === -1 && c !== "Id";
            }).sort(function (a, b) {
                if (a === "Name")
                    return -1;
                if (b === "Name")
                    return 1;
                if (a)
                    return a.localeCompare(b);
                if (b)
                    return b.localeCompare(a);
                return 0;
            });

            if (this.columns().length === 0) {
                newColumns.unshift("Id");
            }

            if (newColumns.length > 0) {
                var createNewCells = function (row) {
                    return newColumns.map(function (c) {
                        return _this.createCell("default-cell-template", c, row, "");
                    });
                };
                this.columns.pushAll(newColumns);

                rows.forEach(function (r) {
                    return r.cells.pushAll(createNewCells(r));
                });
            }
        };

        ctor.prototype.selectOnRightClick = function (row, e) {
            // Like Gmail, we select on right click.
            var rightMouseButton = 2;
            if (e.button === rightMouseButton) {
                if (!row.isChecked()) {
                    row.isChecked(true);
                    this.selectionStack.push(row);
                }
            }
        };

        ctor.prototype.toggleChecked = function (row, e) {
            var _this = this;
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

            if (e && e.shiftKey && this.selectionStack.length > 1) {
                var newSelectionState = row.isChecked();
                var previousSelectionIndex = this.rows.indexOf(newSelectionState ? this.selectionStack[1] : this.selectionStack[0]);
                var validIndices = rowIndex >= 0 && previousSelectionIndex >= 0 && rowIndex != previousSelectionIndex;
                if (validIndices) {
                    var rowsToChange = this.rows.slice(Math.min(rowIndex, previousSelectionIndex), Math.max(rowIndex, previousSelectionIndex));
                    rowsToChange.forEach(function (r) {
                        return r.isChecked(newSelectionState);
                    });

                    if (newSelectionState === true) {
                        rowsToChange.filter(function (r) {
                            return _this.selectionStack.indexOf(r) === -1;
                        }).forEach(function (r) {
                            return _this.selectionStack.push(r);
                        });
                    } else {
                        rowsToChange.filter(function (r) {
                            return _this.selectionStack.indexOf(r) !== -1;
                        }).forEach(function (r) {
                            return _this.selectionStack.splice(_this.selectionStack.indexOf(r), 1);
                        });
                    }
                }
            }
        };

        ctor.prototype.getTemplateForCell = function (columnName, row) {
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
        };

        ctor.prototype.toggleAllRowsChecked = function () {
            this.allRowsChecked(!this.allRowsChecked());
        };

        ctor.prototype.onLastRowVisible = function () {
            var needsMoreRows = this.rows().length < this.totalRowsCount;
            if (needsMoreRows && !this.isLoading()) {
                this.fetchNextChunk();
            }
        };

        ctor.prototype.copySelectedDocs = function (idsOnly) {
            if (typeof idsOnly === "undefined") { idsOnly = false; }
            var docs = this.selectionStack.map(function (r) {
                return r.data;
            });
            if (docs.length > 0) {
                var copyDocsViewModel = new copyDocuments(docs);
                app.showDialog(copyDocsViewModel);
            }
        };

        ctor.prototype.afterRenderColumn = function () {
            var _this = this;
            if (this.isFirstRender) {
                this.isFirstRender = false;

                // Setup infinite scrolling via jQuery appear plugin.
                // Used for determining whether the last row is visible or near visible.
                ($('.document-row:last-child')).appear();
                $(window.document.body).on('appear', '.document-row:last-child', function () {
                    return _this.onLastRowVisible();
                });
            }
        };

        ctor.prototype.createRow = function (rowData, cells) {
            return {
                data: rowData,
                cells: cells,
                isChecked: ko.observable(false)
            };
        };

        ctor.prototype.createCell = function (templateName, columnName, rowData, value) {
            if (columnName === "Id" && !value && rowData && !rowData["Id"] && rowData.__metadata) {
                value = rowData.__metadata.id;
            }

            if (value && typeof (value) == "object") {
                value = ko.toJSON(value);
            }

            var cell = {
                colorClass: "",
                templateName: templateName,
                value: value
            };

            if (columnName === "Id") {
                cell.colorClass = this.memoizedColorClassForEntityName(rowData.__metadata.ravenEntityName);
            }

            return cell;
        };

        ctor.prototype.getColorClassFromEntityName = function (entityName) {
            for (var i = 1; i < this.collections().length; i++) {
                if (this.collections()[i].name === entityName) {
                    return this.collections()[i].colorClass;
                }
            }
        };

        ctor.prototype.onKeyDown = function (sender, e) {
            var deleteKey = 46;
            if (e.which === deleteKey && this.selectionStack.length > 0) {
                e.stopPropagation();
                this.deleteSelection();
            }
        };

        ctor.prototype.deleteSelection = function () {
            var _this = this;
            if (this.selectionStack.length > 0) {
                var selectedItems = this.selectionStack.map(function (s) {
                    return s.data;
                });
                var deleteDocsVm = new deleteDocuments(selectedItems);
                deleteDocsVm.deletionTask.done(function (deletedDocs) {
                    return _this.onItemsDeleted(deletedDocs);
                });
                app.showDialog(deleteDocsVm);
            }
        };

        ctor.prototype.editSelection = function () {
            var lastSelected = this.selectionStack.last();
            if (lastSelected) {
                var docsList = this.currentItemsCollection();
                var currentItemIndex = this.rows.indexOf(lastSelected);
                if (currentItemIndex === -1) {
                    currentItemIndex = 0;
                }
                docsList.currentItemIndex(currentItemIndex);
                var args = { doc: lastSelected.data, docsList: docsList };
                ko.postbox.publish("EditDocument", args);
            }
        };

        ctor.prototype.onItemsDeleted = function (items) {
            var deletedRows = this.rows().filter(function (r) {
                return items.indexOf(r.data) >= 0;
            });
            this.rows.removeAll(deletedRows);
            this.selectionStack.removeAll(deletedRows);
        };
        return ctor;
    })();

    
    return ctor;
});
//# sourceMappingURL=viewModel.js.map
