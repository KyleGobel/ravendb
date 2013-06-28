define(["require", "exports", "models/documentMetadata"], function(require, exports, __documentMetadata__) {
    var documentMetadata = __documentMetadata__;

    var document = (function () {
        function document(dto) {
            this.__metadata = new documentMetadata(dto['@metadata']);

            for (var property in dto) {
                if (property !== '@metadata') {
                    this[property] = dto[property];
                }
            }
        }
        return document;
    })();

    
    return document;
});
//@ sourceMappingURL=document.js.map
