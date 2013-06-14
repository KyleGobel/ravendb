var RavenStudio;
(function (RavenStudio) {
    var DocumentsViewModel = (function () {
        function DocumentsViewModel() {
            this.activePage = "Documents";
            this.documents = new RavenStudio.DataTable("#documentsTable");
        }
        return DocumentsViewModel;
    })();
    RavenStudio.DocumentsViewModel = DocumentsViewModel;    
})(RavenStudio || (RavenStudio = {}));
