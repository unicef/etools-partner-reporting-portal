const PdReportsToolbarUtils = require('../../src/elements/ip-reporting/js/pd-reports-toolbar.js');

describe('Pd Reports Toolbar computePdReportsUrl function', () => {
    // found in polymer/src/endpoints.html
    const _buildUrl = tail => {
        return '/api' + tail;
    }

    // found in polymer/src/endpoints.html
    const programmeDocumentReports = workspaceId => {
        return _buildUrl('/unicef/' + workspaceId + '/progress-reports/');
    }

    // found in polymer/src/elements/ip-reporting/js/progress-reports-toolbar.js
    const computePdReportsUrl = function (locationId) {
        return programmeDocumentReports(locationId);
    }

    const locationId = 10;

    it('returns correct url', () => {
        expect(computePdReportsUrl(locationId)).toBe('/api/unicef/10/progress-reports/');
    });
});