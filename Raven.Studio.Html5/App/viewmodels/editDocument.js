define(["require", "exports", "durandal/app", "durandal/system", "models/document", "common/raven"], function(require, exports, __app__, __sys__, __document__, __raven__) {
    
    var app = __app__;
    var sys = __sys__;

    var document = __document__;
    var raven = __raven__;

    var editDocument = (function () {
        function editDocument() {
            this.document = ko.observable();
            this.documentText = ko.observable();
            this.ravenDb = new raven();
        }
        editDocument.prototype.activate = function (navigationArgs) {
            var _this = this;
            if (navigationArgs.id) {
                var loadDocTask = this.ravenDb.documentWithMetadata(navigationArgs.id);
                loadDocTask.done(function (document) {
                    var meta = document.__metadata;
                    document.__metadata = undefined;
                    _this.documentText(JSON.stringify(document, null, 4));

                    document.__metadata = meta;
                    _this.document(document);
                });
                loadDocTask.fail(function (response) {
                    sys.log("Failed to load document for editing.", response);
                    app.showMessage("Couldn't edit '" + navigationArgs.id + "'. Details logged in the browser console.", ":-(", ['Dismiss']);
                });
                return loadDocTask;
            }
        };
        return editDocument;
    })();
    exports.editDocument = editDocument;
});
//@ sourceMappingURL=editDocument.js.map
