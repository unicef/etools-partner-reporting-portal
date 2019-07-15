function PdOutputUtils() {

}

PdOutputUtils.calculationFormulaAcrossPeriods = function (indicator, localize) {
    return indicator.reportable.blueprint.display_type === 'ratio'
        ? localize('latest')
        : localize(indicator.reportable.blueprint.calculation_formula_across_periods).toLowerCase();
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

PdOutputUtils.computeReportableUrl = function (reportId, data) {
    return App.Endpoints.reportable(reportId, data.id);
};

try {
    module.exports = exports = PdOutputUtils;
} catch (e) {}
