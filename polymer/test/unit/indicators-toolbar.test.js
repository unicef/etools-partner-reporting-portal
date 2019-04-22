// These functions are from endpoints.html
const _buildUrl = tail => '/api' + tail;

const allPDIndicators = workspaceId => {
    return _buildUrl('/unicef/' + workspaceId + '/programme-document/indicators/');
};

describe('IndicatorsToolbar functions', () => {
    describe('computeIndicatorsUrl function', () => {
        const locationId = 451;

        it('builds the correct url', () => {
            expect(allPDIndicators(locationId)).toBe('/api/unicef/451/programme-document/indicators/');
        });
    });
});
