import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

export function shouldDisplayLink(
  displayLink: string,
  report: GenericObject,
  permissions: GenericObject,
  fn: (x?: any, y?: any) => boolean
) {
  return displayLink && fn(permissions, report);
}

export function getReportTitleFull(report: GenericObject, localize: (x: string) => string) {
  let title = '';
  if (report.report_type === 'QPR') {
    title += localize('qpr_short') + report.report_number + ' ' + localize('qpr_long');
  } else if (report.report_type === 'HR') {
    title += localize('hr_short') + report.report_number + ' ' + localize('hr_long');
  } else if (report.report_type === 'SR') {
    title += localize('sr_short') + report.report_number + ' ' + localize('sr_long');
  }
  return title;
}

export function getReportTitle(report: GenericObject, localize: (x: string) => string) {
  let title = '';
  if (report.report_type === 'QPR') {
    title += localize('qpr_short') + report.report_number;
  } else if (report.report_type === 'HR') {
    title += localize('hr_short') + report.report_number;
  } else if (report.report_type === 'SR') {
    title += localize('sr_short') + report.report_number;
  }
  return title;
}

export function getReportLink(
  report: GenericObject,
  suffix: string,
  buildUrlFn: (baseUrl: string, tail: string) => string,
  baseUrl: string
) {
  return buildUrlFn(baseUrl, '/pd/' + report.programme_document.id + '/report/' + report.id + '/' + suffix);
}
