const PdReportsReportTitleUtils = require('../../src/elements/ip-reporting/js/pd-reports-report-title.js');

const { shouldDisplayLink, getReportTitleFull, getReportTitle } = PdReportsReportTitleUtils;

describe('Pd Reports Report Title shouldDisplayLink function', () => {
    const link = true;
    const report = { id: 111 };
    const permissions = { editPermissions: true };
    const fn = () => true;

    it('returns true when provided with truthy values', () => {
        expect(shouldDisplayLink(link, report, permissions, fn)).toBe(true);
    });
});

describe('Pd Reports Report Title getReportTitleFull function', () => {
    const reportQpr = { report_type: 'QPR', report_number: 1138 };
    const reportHr = { report_type: 'HR', report_number: 667 };
    const reportSr = { report_type: 'SR', report_number: 451 };

    it('returns the correct full report title', () => {
        expect(getReportTitleFull(reportQpr)).toBe('QPR1138 (Quarterly Progress Report)');
    });

    it('returns the correct report title for all types', () => {
        expect(getReportTitleFull(reportHr)).toBe('HR667 (Humanitarian Report)');
        expect(getReportTitleFull(reportSr)).toBe('SR451 (Special Report)');
    });
});

describe('Pd Reports Report Title getReportTitle function', () => {
    const report = { report_type: 'QPR', report_number: 7 };

    it('returns the correct report title', () => {
        expect(getReportTitle(report)).toBe('QPR7');
    });
});