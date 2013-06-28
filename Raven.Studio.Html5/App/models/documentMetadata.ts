/// <reference path="../common/dto.ts" />

class documentMetadata {
	ravenEntityName: string;
	ravenClrType: string;
	nonAuthoritativeInfo: boolean;
	id: string;
	tempIndexScore: number;
	lastModified: Date;
	ravenLastModified: Date;
	etag: string;

	constructor(dto: documentMetadataDto) {
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

export = documentMetadata;