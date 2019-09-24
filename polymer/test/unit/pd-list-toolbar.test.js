// These functions are from endpoints.html
const _buildUrl = tail => '/api' + tail;

const programmeDocuments = locationId => {
    return _buildUrl('/unicef/' + locationId + '/programme-document/');
};

describe('PdListToolbar computePdUrl function (PLACEHOLDER)', () => {
    const id = 667;

    it('returns the correct url', () => {
        expect(programmeDocuments(id)).toBe('/api/unicef/667/programme-document/');
    });
});
