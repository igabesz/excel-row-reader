import * as _ from 'lodash';
import * as PYSpreadsheet from 'pyspreadsheet';


export interface IWorkbookProcessor {
	headerCnt: number;
	preOpen?(): void;
	open?(workbook: PYSpreadsheet.Workbook): void;
	processHeader?(row: PYSpreadsheet.Cell[], index: number): void;
	processRow(row: PYSpreadsheet.Cell[], sheet: PYSpreadsheet.Sheet): void;
	close?(): void;
}


export class FileReaderBase {
	// Logger to use by all instances
	static staticLogger: (level: 'fatal' | 'error' | 'info', msg: string, data?: any) => void;
	// Processing can be stopped by setting this result value false
	static staticCanContinue: () => boolean;

	private logger: (level: 'fatal' | 'error' | 'info', msg: string, data?: any) => void;
	private canContinue: () => boolean;
	private exiting = false;

	constructor(
		private processor: IWorkbookProcessor,
		private path: string,
		options?: {
			instanceLogger?: (level: 'fatal' | 'error' | 'info', msg: string, data?: any) => void,
			instanceCanContinue?: () => boolean
		}
	) {
		options = options || {};
		// Setting logger
		if (options.instanceLogger) this.logger = options.instanceLogger;
		else if (FileReaderBase.staticLogger) this.logger = FileReaderBase.staticLogger;
		else this.logger = () => {};
		// Setting canContinue
		if (options.instanceCanContinue) this.canContinue = options.instanceCanContinue;
		else if (FileReaderBase.staticCanContinue) this.canContinue = FileReaderBase.staticCanContinue;
		else this.canContinue = () => true;
	}

	// Filling possibly missing functions
	private ensureFunctions(processor: IWorkbookProcessor) {
		processor.preOpen = processor.preOpen || (() => {});
		processor.open = processor.open || (() => {});
		processor.processHeader = processor.processHeader || (() => {});
		processor.close = processor.close || (() => {});
	}

	halt() {
		this.canContinue = () => false;
	}

	// Processing the whole file. Callback is called on return
	process(cb: (err?:any, data?:any) => void) {
		let processor = this.processor;
		this.ensureFunctions(processor);
		let reader = new PYSpreadsheet.SpreadsheetReader(this.path);
		let rowCnt = 0;

		this.logger('info', `Opening: ${this.path}`);
		reader.on('open', (workbook: PYSpreadsheet.Workbook) => {
			this.logger('info', `Opened: ${this.path}`);
			processor.open(workbook);
		})
		.on('data', (data: PYSpreadsheet.Data) => {
			if (!this.canContinue()) {
				if (!this.exiting) {
					this.logger('fatal', `Reading aborted at row ${rowCnt}`);
					this.exiting = true;
				}
				return;
			}
			for (let i=0; i < data.rows.length; i++) {
				try {
					let row = data.rows[i];
					if (rowCnt < processor.headerCnt)
						processor.processHeader(row, rowCnt);
					else
						processor.processRow(row, data.sheet);
				}
				catch (ex) {
					this.logger('error', `Error processing row ${rowCnt} in ${this.path}`, ex.message);
				}
				rowCnt++;
			}
		})
		.on('close', () => {
			this.logger('info', `Closing ${this.path}`);
			try {
				processor.close();
			}
			catch (ex) {
				this.logger('error', `Error in 'close' handler in ${this.path}`, ex.message);
			}
			if (this.exiting) {
				return cb(new Error('Reading aborted'));
			}
			cb();
		})
		.on('error', (err: any) => {
			this.logger('fatal', `Could not process ${this.path}`, err);
			cb(err);
		});
	}

}
