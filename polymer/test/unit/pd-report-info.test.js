const PdReportInfoUtils = require('../../src/elements/ip-reporting/js/pd-report-info.js');
const {computeMode} = PdReportInfoUtils;

const _buildUrl = tail => '/api' + tail;

describe('PdReportInfo functions', () => {
    describe('PdReportInfo updateUrl function', () => {
        // found in polymer/src/endpoints.html
        programmeDocumentReports = (workspaceId) => {
            return _buildUrl('/unicef/' + workspaceId + '/progress-reports/');
        };
    
          programmeDocumentReport = (workspaceId, reportId) => {
            return programmeDocumentReports(workspaceId) + reportId + '/';
        };
    
        programmeDocumentReportUpdate = (workspaceId, reportId) => {
            return programmeDocumentReport(workspaceId, reportId) + 'update/';
        };
    
        // found in polymer/src/elements/ip-reporting/report-attachments.js
        const computeUpdateUrl = (locationId, reportId) => {
            return programmeDocumentReportUpdate(locationId, reportId);
        };
    
        const locationId = 1;
        const reportId = 2;
    
        it('builds the attachment URL correctly', () => {
            expect(computeUpdateUrl(locationId, reportId)).toBe('/api/unicef/1/progress-reports/2/update/');
        });
    });
    
    describe('PdReportInfo computeMode function', () => {
        const permissions = {savePdReport: true};
        const falsyPermissions = {savePdReport: false};
        const mode = 'edit';
        const overrideMode = '';
        const report = '';
    
        it('returns edit mode when savePdReport is truthy', () => {
            expect(computeMode(mode, overrideMode, report, permissions)).toBe('edit');
        });
    
        it('returns view mode when savePdReport is falsy', () => {
            expect(computeMode(mode, overrideMode, report, falsyPermissions)).toBe('view');
        });
    });
});
