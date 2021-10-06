import Endpoints from '../../../endpoints';
export function calculationFormulaAcrossPeriods(indicator, localize) {
    const localized = indicator.reportable.blueprint.display_type === 'ratio'
        ? localize('latest')
        : localize(indicator.reportable.blueprint.calculation_formula_across_periods);
    if (localized) {
        return localized.toLowerCase();
    }
    return '';
}
// No unit test for this one because it involves DOM manipulation
// and not currently sure how to implement that in Jasmine
export function toggle(e) {
    let node = e.target;
    while (node && typeof node.toggles === 'undefined') {
        node = node.parentNode;
    }
    return node;
}
export function computeIcon(opened) {
    return opened ? 'less' : 'more';
}
export function computeCompleteIndicator(complete) {
    return complete ? 'Met' : 'Ove';
}
export function computeReportableUrl(reportId, data) {
    return Endpoints.reportable(reportId, data.id);
}
