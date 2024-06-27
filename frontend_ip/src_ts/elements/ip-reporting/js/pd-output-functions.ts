import Endpoints from '../../../endpoints';

export function calculationFormulaAcrossPeriods(indicator: any, localize: (x: string) => string) {
  const localized =
    indicator.reportable.blueprint.display_type === 'ratio'
      ? localize('latest')
      : localize(indicator.reportable.blueprint.calculation_formula_across_periods);
  if (localized) {
    return localized.toLowerCase();
  }
  return '';
}

// No unit test for this one because it involves DOM manipulation
// and not currently sure how to implement that in Jasmine
export function toggle(e: CustomEvent) {
  let node = e.target as any;

  while (node && typeof node.toggles === 'undefined') {
    node = node.parentNode;
  }
  return node;
}

export function computeIcon(opened: boolean) {
  return opened ? 'less' : 'more';
}

export function computeCompleteIndicator(complete: boolean) {
  return complete ? 'Met' : 'Ove';
}

export function computeReportableUrl(reportId: string, data: any) {
  return Endpoints.reportable(reportId, data.id);
}
