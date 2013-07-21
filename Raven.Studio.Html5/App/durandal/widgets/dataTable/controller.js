define(["require", "exports", "common/pagedList", "models/document", "models/collection", "common/pagedResultSet"], function(require, exports, __pagedList__, __document__, __collection__, __pagedResultSet__) {
    
    var pagedList = __pagedList__;
    var document = __document__;
    var collection = __collection__;
    var pagedResultSet = __pagedResultSet__;

    var ctor = (function () {
        function ctor(element, settings) {
            var _this = this;
            this.element = element;
            this.settings = settings;
            this.rows = ko.observableArray();
            this.columns = ko.observableArray();
            this.selectionStack = [];
            this.isFirstRender = true;
            this.skip = 0;
            this.take = 100;
            this.totalRowsCount = 0;
            if (!settings.items || !ko.isObservable(settings.items)) {
                throw new Error("datatable must be passed an items observable.");
            }

            this.currentItemsCollection = this.settings.items;
            this.collections = this.settings.collections;
            this.memoizedColorClassForEntityName = this.getColorClassFromEntityName.memoize(this);
            this.fetchNextChunk();

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

            this.currentItemsCollection.subscribe(function () {
                _this.rows.removeAll();
                _this.columns.removeAll();
                _this.fetchNextChunk();
            });
            if (this.currentItemsCollection()) {
                this.fetchNextChunk();
            }

            $(window).resize(function () {
                return _this.sizeTable();
            });
        }
        ctor.prototype.sizeTable = function () {
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

        ctor.prototype.toggleChecked = function (row, e) {
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
                    this.rows.slice(Math.min(rowIndex, previousSelectionIndex), Math.max(rowIndex, previousSelectionIndex)).forEach(function (r) {
                        return r.isChecked(newSelectionState);
                    });
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

        ctor.prototype.loadMoreIfNeeded = function () {
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
        };

        ctor.prototype.afterRenderColumn = function () {
            var _this = this;
            if (this.isFirstRender) {
                var dataTable = $(this.element).find(".datatable");
                if (dataTable != null) {
                    this.isFirstRender = false;
                    this.sizeTable();
                    dataTable.scroll(function () {
                        return _this.loadMoreIfNeeded();
                    });
                }
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
        return ctor;
    })();

    
    return ctor;
});
//@ sourceMappingURL=controller.js.map
