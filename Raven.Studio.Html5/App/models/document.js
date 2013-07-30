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
        document.prototype.getId = function () {
            return this.__metadata.id;
        };

        document.prototype.toDto = function (includeMeta) {
            if (typeof includeMeta === "undefined") { includeMeta = false; }
            var dto = { '@metadata': undefined };
            for (var property in this) {
                var isMeta = property === '__metadata' || property === '__moduleId__';
                var isFunction = typeof this[property] === 'function';
                if (!isMeta && !isFunction) {
                    dto[property] = this[property];
                }
            }

            if (includeMeta && this.__metadata) {
                dto['@metadata'] = this.__metadata.toDto();
            }

            return dto;
        };
        return document;
    })();

    
    return document;
});
//@ sourceMappingURL=document.js.map
