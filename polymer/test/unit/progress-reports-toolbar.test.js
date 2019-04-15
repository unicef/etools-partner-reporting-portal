const ProgressReportsToolbarUtil = require('../../src/elements/ip-reporting/js/progress-reports-toolbar.js');

const {canExport} = ProgressReportsToolbarUtil;

describe('ProgressReportsToolbar computePdReportsUrl function', () => {
    // found in polymer/src/endpoints.html
    const _buildUrl = tail => {
        return '/api' + tail;
    };

    // found in polymer/src/endpoints.html
    const programmeDocumentReports = workspaceId => {
        return _buildUrl('/unicef/' + workspaceId + '/progress-reports/');
    };

    // found in polymer/src/elements/ip-reporting/js/progress-reports-toolbar.js
    const computePdReportsUrl = function (locationId) {
        return programmeDocumentReports(locationId);
    };

    const locationId = 5;

    it('returns correct url', () => {
        expect(computePdReportsUrl(locationId)).toBe('/api/unicef/5/progress-reports/');
    });
});

describe('ProgressReportsToolbar canExport function', () => {
    const totalResults = 10;
    const zeroResults = 0;
    const negResults = -1;

    it('returns true if number is greater than 0', () => {
        expect(canExport(totalResults)).toBe(true);
    });

    it('returns false if number is 0 or less than 0', () => {
        expect(canExport(zeroResults)).toBe(false);
        expect(canExport(negResults)).toBe(false);
    });
});
