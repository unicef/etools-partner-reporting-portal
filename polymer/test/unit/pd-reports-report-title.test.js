const PdReportsReportTitleUtils = require('../../src/elements/ip-reporting/js/pd-reports-report-title.js');

const {shouldDisplayLink,
    getReportTitleFull,
    getReportTitle,
    getReportLink} = PdReportsReportTitleUtils;

describe('PdReportsReportTitle shouldDisplayLink function', () => {
    const link = true;
    const report = {id: 111};
    const permissions = {editPermissions: true};
    const fn = () => true;

    it('returns true when provided with truthy values', () => {
        expect(shouldDisplayLink(link, report, permissions, fn)).toBe(true);
    });
});

describe('PdReportsReportTitle getReportTitleFull function', () => {
    const reportQpr = {report_type: 'QPR', report_number: 1138};
    const reportHr = {report_type: 'HR', report_number: 667};
    const reportSr = {report_type: 'SR', report_number: 451};

    it('returns the correct full report title', () => {
        expect(getReportTitleFull(reportQpr)).toBe('QPR1138 (Quarterly Progress Report)');
    });

    it('returns the correct report title for all types', () => {
        expect(getReportTitleFull(reportHr)).toBe('HR667 (Humanitarian Report)');
        expect(getReportTitleFull(reportSr)).toBe('SR451 (Special Report)');
    });
});

describe('PdReportsReportTitle getReportTitle function', () => {
    const report = {report_type: 'QPR', report_number: 7};

    it('returns the correct report title', () => {
        expect(getReportTitle(report)).toBe('QPR7');
    });
});

describe('PdReportsReportTitle getReportLink function', () => {
    const report = {id: 491, programme_document: {id: 528}};
    const suffix = 'view';
    const baseUrl = '/app/SDN/ip-reporting';

    const buildUrl = (baseUrl, tail) => {
        if (tail.length && tail[0] !== '/') {
            tail = '/' + tail;
        }
        return baseUrl + tail;
    };

    it('builds the correct URL', () => {
        expect(getReportLink(report, suffix, buildUrl, baseUrl)).toBe('/app/SDN/ip-reporting/pd/528/report/491/view');
    });
});
