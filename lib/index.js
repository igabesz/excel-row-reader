"use strict";
var PYSpreadsheet = require('pyspreadsheet');
var FileReaderBase = (function () {
    function FileReaderBase(processor, path, options) {
        this.processor = processor;
        this.path = path;
        this.exiting = false;
        options = options || {};
        if (options.instanceLogger)
            this.logger = options.instanceLogger;
        else if (FileReaderBase.staticLogger)
            this.logger = FileReaderBase.staticLogger;
        else
            this.logger = function () { };
        if (options.instanceCanContinue)
            this.canContinue = options.instanceCanContinue;
        else if (FileReaderBase.staticCanContinue)
            this.canContinue = FileReaderBase.staticCanContinue;
        else
            this.canContinue = function () { return true; };
    }
    FileReaderBase.prototype.ensureFunctions = function (processor) {
        processor.preOpen = processor.preOpen || (function () { });
        processor.open = processor.open || (function () { });
        processor.processHeader = processor.processHeader || (function () { });
        processor.close = processor.close || (function () { });
    };
    FileReaderBase.prototype.halt = function () {
        this.canContinue = function () { return false; };
    };
    FileReaderBase.prototype.process = function (cb) {
        var _this = this;
        var processor = this.processor;
        this.ensureFunctions(processor);
        var reader = new PYSpreadsheet.SpreadsheetReader(this.path);
        var rowCnt = 0;
        this.logger('info', "Opening: " + this.path);
        reader.on('open', function (workbook) {
            _this.logger('info', "Opened: " + _this.path);
            processor.open(workbook);
        })
            .on('data', function (data) {
            if (_this.canContinue()) {
                if (!_this.exiting) {
                    _this.logger('fatal', "Reading aborted at row " + rowCnt);
                    _this.exiting = true;
                }
                return;
            }
            for (var i = 0; i < data.rows.length; i++) {
                try {
                    var row = data.rows[i];
                    if (rowCnt < processor.headerCnt)
                        processor.processHeader(row, rowCnt);
                    else
                        processor.processRow(row, data.sheet);
                }
                catch (ex) {
                    _this.logger('error', "Error processing row " + rowCnt + " in " + _this.path, ex.message);
                }
                rowCnt++;
            }
        })
            .on('close', function () {
            _this.logger('info', "Closing " + _this.path);
            try {
                processor.close();
            }
            catch (ex) {
                _this.logger('error', "Error in 'close' handler in " + _this.path, ex.message);
            }
            if (_this.exiting) {
                return cb(new Error('Reading aborted'));
            }
            cb();
        })
            .on('error', function (err) {
            _this.logger('fatal', "Could not process " + _this.path, err);
            cb(err);
        });
    };
    return FileReaderBase;
}());
exports.FileReaderBase = FileReaderBase;
//# sourceMappingURL=index.js.map