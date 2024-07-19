import {get as getTranslation} from 'lit-translate';

export function shouldDisplayLink(
  displayLink: boolean,
  report: any,
  permissions: any,
  fn: (x?: any, y?: any) => boolean
) {
  return displayLink && fn(permissions, report);
}

export function getReportTitleFull(report: any) {
  let title = '';
  if (report.report_type === 'QPR') {
    title += getTranslation('qpr_short') + report.report_number + ' ' + getTranslation('qpr_long');
  } else if (report.report_type === 'HR') {
    title += getTranslation('hr_short') + report.report_number + ' ' + getTranslation('hr_long');
  } else if (report.report_type === 'SR') {
    title += getTranslation('sr_short') + report.report_number + ' ' + getTranslation('sr_long');
  }
  return title;
}

export function getReportTitle(report: any) {
  let title = '';
  if (report.report_type === 'QPR') {
    title += getTranslation('qpr_short') + report.report_number;
  } else if (report.report_type === 'HR') {
    title += getTranslation('hr_short') + report.report_number;
  } else if (report.report_type === 'SR') {
    title += getTranslation('sr_short') + report.report_number;
  }
  return title;
}

export function getReportLink(
  report: any,
  suffix: string,
  buildUrlFn: (baseUrl: string, tail: string) => string,
  baseUrl: string
) {
  return buildUrlFn(baseUrl, '/pd/' + report.programme_document.id + '/report/' + report.id + '/' + suffix);
}
