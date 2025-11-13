export interface NoteMeta {
	title?: string;
	created?: string;
	modified?: string;
	pinnedAt?: string;
	[key: string]: string | undefined;
}

export interface Note {
	path: string;
	meta: NoteMeta;
	body: string;
	tags: string[];
	links: string[];
}
