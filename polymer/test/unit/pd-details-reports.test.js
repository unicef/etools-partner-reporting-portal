const PdDetailsReportsUtils = require('../../src/elements/ip-reporting/js/pd-details-reports');
const {
    computePDReportsUrl,
    computePDReportsParams} = PdDetailsReportsUtils;

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

describe('PdDetailsReports computePDReportsParams function', () => {
    const queryParams = {'page_size': 10, 'page': 1};
    const pdId = 528;

    const reportsParams = {'page_size': 10, 'page': 1, 'programme_document': 528};

    it('returns new object with pdId and queryParams', () => {
        expect(computePDReportsParams(pdId, queryParams)).toEqual(reportsParams);
    });
});
