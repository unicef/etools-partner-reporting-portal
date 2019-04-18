const PdDetailsReportsUtils = require('../../src/elements/ip-reporting/js/pd-details-reports');
const {computePDReportsUrl} = PdDetailsReportsUtils;

// These functions are from endpoints.html
const _buildUrl = tail => '/api' + tail;

const programmeDocumentReports = workspaceId => {
    return _buildUrl('/unicef/' + workspaceId + '/progress-reports/');
};

describe('PdDetailsReports computePDReportsUrl function', () => {
    const locationId = 1138;

    it('calculates the correct url if locationId is truthy', () => {
        expect(programmeDocumentReports(locationId)).toBe('/api/unicef/1138/progress-reports/');
    });

    it('returns empty string if locationId is falsy', () => {
        expect(computePDReportsUrl()).toBe('');
    });
});
