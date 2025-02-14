import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';

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
    title += getTranslation('QPR_SHORT') + report.report_number + ' ' + getTranslation('QPR_LONG');
  } else if (report.report_type === 'HR') {
    title += getTranslation('HR_SHORT') + report.report_number + ' ' + getTranslation('HR_LONG');
  } else if (report.report_type === 'SR') {
    title += getTranslation('SR_SHORT') + report.report_number + ' ' + getTranslation('SR_LONG');
  }
  return title;
}

export function getReportTitle(report: any) {
  let title = '';
  if (report.report_type === 'QPR') {
    title += getTranslation('QPR_SHORT') + report.report_number;
  } else if (report.report_type === 'HR') {
    title += getTranslation('HR_SHORT') + report.report_number;
  } else if (report.report_type === 'SR') {
    title += getTranslation('SR_SHORT') + report.report_number;
  }
  return title;
}

export function getReportLink(
  report: any,
  suffix: string,
  buildUrlFn: (baseUrl: string, tail: string) => string,
  baseUrl: string,
  isGpd: boolean
) {
  const prefix = isGpd ? '/gpd/' : '/pd/';
  return buildUrlFn(baseUrl, prefix + report.programme_document.id + '/report/' + report.id + '/' + suffix);
}
