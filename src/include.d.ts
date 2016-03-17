declare module 'pyspreadsheet' {

	interface Workbook {
		file: string;
		meta: {
			user: string;
			sheets: Sheet[];
		};
	}

	interface Sheet {
		index: number;
		name: string;
		bounds: {
			rows: number;
			columns: number;
		};
		visibility: string;
	}

	interface Data {
		workbook: Workbook;
		sheet: Sheet;
		rows: Cell[][];
	}

	interface Cell {
		row: number;
		column: number;
		address: string;
		value: any;
	}

	interface OpenHandler {
		(workbook: Workbook): void;
	}
	interface DataHandler {
		(data: Data): void;
	}
	interface ErrorHandler {
		(err: any): void;
	}
	interface CloseHandler {
		(): void;
	}

	interface SpreadsheetReader {
		on(name: string, callback: OpenHandler | DataHandler | ErrorHandler | CloseHandler): SpreadsheetReader;
	}

	export var SpreadsheetReader: {
		new (path: string): SpreadsheetReader;
	};
}
