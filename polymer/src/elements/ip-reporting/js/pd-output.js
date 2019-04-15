function PdOutputUtils() {

};

PdOutputUtils.calculationFormulaAcrossPeriods = function (indicator) {
    return indicator.reportable.blueprint.display_type === 'ratio'
        ? 'latest' : indicator.reportable.blueprint.calculation_formula_across_periods;
};

// No unit test for this one because it involves DOM manipulation
// and not currently sure how to implement that in Jasmine
PdOutputUtils.toggle = function (e) {
    var node = e.target;

    while (node && typeof node.toggles === 'undefined') {
      node = node.parentNode;
    }
    return node;
};

PdOutputUtils.computeIcon = function (opened) {
    return opened ? 'less' : 'more';
};

PdOutputUtils.computeCompleteIndicator = function (complete) {
    return complete ? 'Met' : 'Ove';
};

try {
    module.exports = exports = PdOutputUtils;
} catch (e) {}
