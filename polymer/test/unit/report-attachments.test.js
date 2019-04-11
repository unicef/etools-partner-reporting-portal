const ReportAttachmentsUtils = require('../../src/elements/ip-reporting/js/report-attachments.js');

const { computeListUrl } = ReportAttachmentsUtils;

describe('Report attachments computeListUrl function', () => {
    const reportId = 1;
    const locationId = 2;

    it('works?', () => {
        expect(computeListUrl(locationId, reportId)).toBe('/api/unicef/2/progress-reports/1/attachments/')
    });
});