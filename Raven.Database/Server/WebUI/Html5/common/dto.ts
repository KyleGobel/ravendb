interface collectionInfoDto {
	Results: documentDto[];
	Includes: any[];
	IsStale: boolean;
	IndexTimestamp: string;
	TotalResults: number;
	SkippedResults: number;
	IndexName: string;
	IndexEtag: string;
	ResultEtag: string;
	Highlightings: any;
	NonAuthoritativeInformation: boolean;
	LastQueryTime: string;
	DurationMilliseconds: number;
}

interface documentDto {
	'@metadata': documentMetadataDto;
}

interface documentMetadataDto {
	'Raven-Entity-Name': string;
	'Raven-Clr-Type': string;
	'Non-Authoritative-Information': boolean;
	'@id': string;
	'Temp-Index-Score': number;
	'Last-Modified': string;
	'Raven-Last-Modified': string;
	'@etag': string;
}