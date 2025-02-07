export enum IS {
	NO, YES
}

export type PageContainer = { key: string, visible?: boolean, next?: boolean, prev?: boolean, payload?: { [props: string]: any } }

