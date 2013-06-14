/// <reference path="../Controls/dataTable.ts" />

module RavenStudio {
    export class DocumentsViewModel {

        activePage = "Documents";
        documents = new RavenStudio.DataTable("#documentsTable");
                
        constructor() {
        }
    }
}