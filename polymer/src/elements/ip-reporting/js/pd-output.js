function PdOutputUtils() {

};

PdOutputUtils.calculationFormulaAcrossPeriods = function (indicator) {
    return indicator.reportable.blueprint.display_type === 'ratio'
        ? 'latest' : indicator.reportable.blueprint.calculation_formula_across_periods;
};

try {
    module.exports = exports = PdOutputUtils;
} catch (e) {}
