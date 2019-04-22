// These functions are from endpoints.html
const _buildUrl = tail => '/api' + tail;

const programmeDocumentDocDownload = (locationId, pdId) => {
    return _buildUrl('/unicef/' + locationId +
        '/programme-document/' + pdId + '/pmp-document/');
};

describe('PdDetailsDocDownload functions', () => {
    describe('computeDocUrl function (PLACEHOLDER)', () => {
        const locationId = 528;
        const pdId = 491;

        it('should build the url', () => {
            expect(programmeDocumentDocDownload(locationId, pdId))
                .toBe('/api/unicef/528/programme-document/491/pmp-document/');
        });
    });
});
