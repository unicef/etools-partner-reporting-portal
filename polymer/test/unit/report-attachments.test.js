const ReportAttachmentsUtils = require('../../src/elements/ip-reporting/js/report-attachments.js');

describe('Report attachments computeListUrl function', () => {
    // found in polymer/src/endpoints.html
    const _buildUrl = tail => '/api' + tail;

    // found in polymer/src/endpoints.html
    const progressReports = locationId => {
        return _buildUrl('/unicef/' + locationId + '/progress-reports/');
    }

    // found in polymer/src/endpoints.html
    const progressReportAttachments = (locationId, reportId) => {
        return progressReports(locationId) + reportId + '/attachments/';
    }

    // found in polymer/src/elements/ip-reporting/report-attachments.js
    const computeListUrl = (locationId, reportId) => {
        return progressReportAttachments(locationId, reportId);
    }

    const reportId = 1;
    const locationId = 2;

    it('builds the URL correctly', () => {
        expect(computeListUrl(locationId, reportId)).toBe('/api/unicef/2/progress-reports/1/attachments/')
    });
});