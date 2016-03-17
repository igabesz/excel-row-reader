import * as PYSpreadsheet from 'pyspreadsheet';
export interface IWorkbookProcessor {
    headerCnt: number;
    preOpen?(): void;
    open?(workbook: PYSpreadsheet.Workbook): void;
    processHeader?(row: PYSpreadsheet.Cell[], index: number): void;
    processRow(row: PYSpreadsheet.Cell[], sheet: PYSpreadsheet.Sheet): void;
    close?(): void;
}
export declare class FileReaderBase {
    private processor;
    private path;
    static staticLogger: (level: 'fatal' | 'error' | 'info', msg: string, data?: any) => void;
    static staticCanContinue: () => boolean;
    private logger;
    private canContinue;
    private exiting;
    constructor(processor: IWorkbookProcessor, path: string, options?: {
        instanceLogger?: (level: 'fatal' | 'error' | 'info', msg: string, data?: any) => void;
        instanceCanContinue?: () => boolean;
    });
    private ensureFunctions(processor);
    halt(): void;
    process(cb: (err?: any, data?: any) => void): void;
}
