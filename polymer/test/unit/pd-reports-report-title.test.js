const PdReportsReportTitleUtils = require('../../src/elements/ip-reporting/js/pd-reports-report-title.js');

const { shouldDisplayLink } = PdReportsReportTitleUtils;

describe('Pd Report Report Title shouldDisplayLink function', () => {
    const link = true;
    const report = { id: 111 };
    const permissions = { editPermissions: true };
    const fn = () => true;

    it('returns true when provided with truthy values', () => {
        expect(shouldDisplayLink(link, report, permissions, fn)).toBe(true);
    });
});