const PdDetailsCalculationMethodsUtils = require('../../src/elements/ip-reporting/js/pd-details-calculation-methods');
const {
    computeFormattedData,
    computeSelected} = PdDetailsCalculationMethodsUtils;

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

    describe('computeFormattedData function', () => {
        const data = {
            ll_outputs_and_indicators: [
                {
                    ll_output: {id: 5, title: 'hello'},
                    indicators: [{a: 1}]
                }
            ]
        };

        const formatted = [
            {type: 'label', text: 'hello'},
            {type: 'data', data: {a: 1, editable: true}, llo_id: 5}
        ];

        it('builds the correct array from a given object', () => {
            expect(computeFormattedData(data)).toEqual(formatted);
        });
    });

    describe('computeSelected function', () => {
        const data = {calculation: 'sum'};
        const scope = 'calculation';

        it('gets the correct value', () => {
            expect(computeSelected(data, scope)).toBe('sum');
        });
    });
});
