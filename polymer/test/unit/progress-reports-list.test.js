const ProgressReportsListUtils = require('../../src/elements/ip-reporting/js/progress-reports-list.js');

const {getReportTitle} = ProgressReportsListUtils;

describe('ProgressReportsList getReportTitle function', () => {
    const report = {report_type: 'Cool', report_number: 20};

    it('returns correct title string', () => {
        expect(getReportTitle(report)).toBe('Cool20');
    });
});
