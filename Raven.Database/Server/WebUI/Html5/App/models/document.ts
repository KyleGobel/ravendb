import documentMetadata = require("models/documentMetadata");

class document {
	__metadata: documentMetadata;
    constructor(dto: documentDto) {
        this.__metadata = new documentMetadata(dto['@metadata']);

		for (var property in dto) { 
			if (property !== '@metadata') {
				this[property] = dto[property];
			}
		}
    }

	getId() {
		return this.__metadata.id;
	}

	toDto(includeMeta: boolean = false): documentDto {
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

		return <any>dto;
	}
}

export = document; 