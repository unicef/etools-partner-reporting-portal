const PdOutputUtils = require('../../src/elements/ip-reporting/js/pd-output.js');
const {calculationFormulaAcrossPeriods,
    computeIcon,
    computeCompleteIndicator} = PdOutputUtils;

describe('PdOutput calculationFormulaAcrossPeriods function', () => {
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

describe('PdOutput computeIcon function', () => {
    const opened = undefined;
    const openedTrue = true;

    it('returns more if opened is falsy', () => {
        expect(computeIcon(opened)).toBe('more');
    });
    
    it('returns less if opened is truthy', () => {
        expect(computeIcon(openedTrue)).toBe('less');
    });
});

describe('PdOutput computeCompleteIndicator function', () => {
    const complete = false;
    const completeTrue = true;

    it('returns more if opened is falsy', () => {
        expect(computeCompleteIndicator(complete)).toBe('Ove');
    });
    
    it('returns less if opened is truthy', () => {
        expect(computeCompleteIndicator(completeTrue)).toBe('Met');
    });
});
