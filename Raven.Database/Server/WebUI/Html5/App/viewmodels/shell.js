define(["require", "exports", "durandal/plugins/router", "durandal/app", "durandal/system", "models/database", "common/raven"], function(require, exports, __router__, __app__, __sys__, __database__, __raven__) {
    var router = __router__;
    var app = __app__;
    var sys = __sys__;

    var database = __database__;
    var raven = __raven__;

    var shell = (function () {
        function shell() {
            var _this = this;
            this.router = router;
            this.databases = ko.observableArray();
            this.activeDatabase = ko.observable().subscribeTo("ActivateDatabase");
            this.ravenDb = new raven();

            ko.postbox.subscribe("EditDocument", function (args) {
                return _this.launchDocEditor(args.doc.getId());
            });
        }
        shell.prototype.databasesLoaded = function (databases) {
            var systemDatabase = new database("<system>");
            systemDatabase.isSystem = true;
            this.databases(databases.concat([systemDatabase]));
            this.databases()[0].activate();
        };

        shell.prototype.activate = function () {
            var _this = this;
            return this.ravenDb.databases().fail(function (result) {
                sys.log("Unable to connect to Raven.", result);
                app.showMessage("Couldn't connect to Raven. Details in the browser console.", ":-(", ['Dismiss']);
                $('.splash').hide();
            }).then(function (results) {
                return _this.databasesLoaded(results);
            }).then(function () {
                return router.activate('documents');
            });
        };

        shell.prototype.launchDocEditor = function (docId) {
            router.navigateTo("#edit?id=" + encodeURIComponent(docId));
        };
        return shell;
    })();

    
    return shell;
});
//@ sourceMappingURL=shell.js.map
