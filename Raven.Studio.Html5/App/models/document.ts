import documentMetadata = module("models/documentMetadata");

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
}

export = document; 