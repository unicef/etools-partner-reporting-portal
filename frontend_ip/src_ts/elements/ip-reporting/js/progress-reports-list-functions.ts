import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

export function getReportTitle(report: GenericObject) {
  return report.report_type + report.report_number;
}
