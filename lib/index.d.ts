export interface Workbook {
    file: string;
    meta: {
        user: string;
        sheets: Sheet[];
    };
}
export interface Sheet {
    index: number;
    name: string;
    bounds: {
        rows: number;
        columns: number;
    };
    visibility: string;
}
export interface Cell {
    row: number;
    column: number;
    address: string;
    value: any;
}
export interface IWorkbookProcessor {
    headerCnt: number;
    preOpen?(): void;
    open?(workbook: Workbook): void;
    processHeader?(row: Cell[], index: number): void;
    processRow(row: Cell[], sheet: Sheet): void;
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
