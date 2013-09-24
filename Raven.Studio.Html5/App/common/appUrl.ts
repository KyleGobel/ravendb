import database = require("models/database");
import raven = require("common/raven");

// Helper class with static methods for generating app URLs.
class appUrl {

    // Gets the URL for edit document.
    static forEditDoc(id?: string, collectionName?: string, docIndexInCollection?: number, db: database = raven.activeDatabase()): string {
        var databaseUrlPart = db ? "&database=" + encodeURIComponent(db.name) : "";
        var docIdUrlPart = id ? "&id=" + encodeURIComponent(id) : "";
        var pagedListInfo = collectionName && docIndexInCollection != null ? "&list=" + encodeURIComponent(collectionName) + "&item=" + docIndexInCollection : "";
        return "#edit?" + docIdUrlPart + databaseUrlPart + pagedListInfo;
    } 
}

export = appUrl;