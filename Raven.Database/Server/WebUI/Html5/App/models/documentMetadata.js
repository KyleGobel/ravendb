define(["require", "exports"], function(require, exports) {
    var documentMetadata = (function () {
        function documentMetadata(dto) {
            if (dto) {
                this.ravenEntityName = dto['Raven-Entity-Name'];
                this.ravenClrType = dto['Raven-Clr-Type'];
                this.nonAuthoritativeInfo = dto['Non-Authoritative-Information'];
                this.id = dto['@id'];
                this.tempIndexScore = dto['Temp-Index-Score'];
                this.lastModified = dto['Last-Modified'];
                this.ravenLastModified = dto['Raven-Last-Modified'];
                this.etag = dto['@etag'];
            }
        }
        documentMetadata.prototype.toDto = function () {
            return {
                'Raven-Entity-Name': this.ravenEntityName,
                'Raven-Clr-Type': this.ravenClrType,
                'Non-Authoritative-Information': this.nonAuthoritativeInfo,
                '@id': this.id,
                'Temp-Index-Score': this.tempIndexScore,
                'Last-Modified': this.lastModified,
                'Raven-Last-Modified': this.ravenLastModified,
                '@etag': this.etag
            };
        };
        return documentMetadata;
    })();

    
    return documentMetadata;
});
//@ sourceMappingURL=documentMetadata.js.map
