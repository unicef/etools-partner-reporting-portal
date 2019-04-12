const PdReportsToolbarUtils = require('../../src/elements/ip-reporting/js/pd-reports-toolbar.js');

const { canExport, computePdQuery } = PdReportsToolbarUtils;

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

describe('Pd Reports Toolbar canExport function', () => {
    const totalResults = 5;
    const zeroResults = 0;

    it('returns true if number is greater than 0', () => {
        expect(canExport(totalResults)).toBe(true);
    });

    it('returns false if number is 0 or less than 0', () => {
        expect(canExport(zeroResults)).toBe(false);
    });
});

describe('Pd Reports Toolbar computePdQuery function', () => {
    const id = '800';

    it('returns an object with the correct id', () => {
        expect(computePdQuery(id)).toEqual({ programme_document: '800' });
    });
});