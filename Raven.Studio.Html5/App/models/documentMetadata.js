define(["require", "exports"], function(require, exports) {
    var documentMetadata = (function () {
        function documentMetadata(dto) {
            if (dto) {
                this.ravenEntityName = dto['Raven-Entity-Name'];
                this.ravenClrType = dto['Raven-Clr-Type'];
                this.nonAuthoritativeInfo = dto['Non-Authoritative-Information'];
                this.id = dto['@id'];
                this.tempIndexScore = dto['Temp-Index-Score'];
                this.lastModified = new Date(dto['Last-Modified']);
                this.ravenLastModified = new Date(dto['Raven-Last-Modified']);
                this.etag = dto['@etag'];
            }
        }
        return documentMetadata;
    })();

    
    return documentMetadata;
});
//@ sourceMappingURL=documentMetadata.js.map
