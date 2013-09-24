define(["require", "exports", "models/database", "common/raven"], function(require, exports, __database__, __raven__) {
    var database = __database__;
    var raven = __raven__;

    // Helper class with static methods for generating app URLs.
    var appUrl = (function () {
        function appUrl() {
        }
        appUrl.forEditDoc = // Gets the URL for edit document.
        function (id, collectionName, docIndexInCollection, db) {
            if (typeof db === "undefined") { db = raven.activeDatabase(); }
            var databaseUrlPart = db ? "&database=" + encodeURIComponent(db.name) : "";
            var docIdUrlPart = id ? "&id=" + encodeURIComponent(id) : "";
            var pagedListInfo = collectionName && docIndexInCollection != null ? "&list=" + encodeURIComponent(collectionName) + "&item=" + docIndexInCollection : "";
            return "#edit?" + docIdUrlPart + databaseUrlPart + pagedListInfo;
        };
        return appUrl;
    })();

    
    return appUrl;
});
//# sourceMappingURL=appUrl.js.map
