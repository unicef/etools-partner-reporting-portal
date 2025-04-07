import Endpoints from '../../../endpoints';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';

export function calculationFormulaAcrossPeriods(indicator: any) {
  const localized =
    indicator.reportable.blueprint.display_type === 'ratio'
      ? getTranslation('LATEST')
      : getTranslation(indicator.reportable.blueprint.calculation_formula_across_periods);
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
