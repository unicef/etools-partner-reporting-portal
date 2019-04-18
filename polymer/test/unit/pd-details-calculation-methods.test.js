// These functions are from endpoints.html
const _buildUrl = tail => '/api' + tail;

const calculationMethods = (workspaceId, pdId) => {
    return _buildUrl(
        '/unicef/' +
        workspaceId +
        '/programme-document/' +
        pdId +
        '/calculation-methods/'
    );
};

describe('PdDetailsCalculationMethods functions', () => {
    describe('computeIndicatorsUrl function', () => {
        const locationId = 451;
        const pdId = 667;

        it('builds the url correctly', () => {
            expect(calculationMethods(locationId, pdId))
                .toBe('/api/unicef/451/programme-document/667/calculation-methods/');
        });
    });
});
