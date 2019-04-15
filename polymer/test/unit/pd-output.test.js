const PdOutputUtils = require('../../src/elements/ip-reporting/js/pd-output.js');
const {calculationFormulaAcrossPeriods} = PdOutputUtils;

describe('Pd Output calculationFormulaAcrossPeriods function', () => {
    const indicator = {
        reportable: {
            blueprint: {
                display_type: 'number',
                calculation_formula_across_periods: 'sum'
            }
        }
    };

    const indicatorRatio = {
        reportable: {
            blueprint: {
                display_type: 'ratio',
            }
        }
    };

    it('returns sum if display_type is anything other than ratio', () => {
        expect(calculationFormulaAcrossPeriods(indicator)).toBe('sum');
    });

    it('returns latest if display_type is ratio', () => {
        expect(calculationFormulaAcrossPeriods(indicatorRatio)).toBe('latest');
    });
});
