const ReportAttachmentsUtils = require('../../src/elements/ip-reporting/js/report-attachments.js');

// Functions for testing endpoints - TODO: FIX THIS so it's actually importing
// found in polymer/src/endpoints.html
const _buildUrl = tail => '/api' + tail;

// found in polymer/src/endpoints.html
const progressReports = locationId => {
    return _buildUrl('/unicef/' + locationId + '/progress-reports/');
}

describe('Report attachments computeListUrl function', () => {
    // found in polymer/src/endpoints.html
    const progressReportAttachments = (locationId, reportId) => {
        return progressReports(locationId) + reportId + '/attachments/';
    }

    // found in polymer/src/elements/ip-reporting/report-attachments.js
    const computeListUrl = (locationId, reportId) => {
        return progressReportAttachments(locationId, reportId);
    }

    const locationId = 1;
    const reportId = 2;

    it('builds the attachment URL correctly', () => {
        expect(computeListUrl(locationId, reportId)).toBe('/api/unicef/1/progress-reports/2/attachments/')
    });
});

describe('Report attachments getDeleteUrl function', () => {
    // found in polymer/src/endpoints.html
    const progressReportAttachmentDetail = (locationId, reportId, attachmentId) => {
        return progressReports(locationId) + reportId + '/attachments/' + attachmentId + '/';
    }
    
    // found in polymer/src/elements/ip-reporting/report-attachments.js
    const getDeleteUrl = (locationId, reportId, attachmentId) => {
        return progressReportAttachmentDetail(locationId, reportId, attachmentId);
    }

    const locationId = 1;
    const reportId = 2;
    const attachmentId = 3;


    it('builds the delete URL correctly', () => {
        expect(getDeleteUrl(locationId, reportId, attachmentId)).toBe('/api/unicef/1/progress-reports/2/attachments/3/')
    });
});