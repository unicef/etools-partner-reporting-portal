import {GenericObject} from '../../../typings/globals.types';

export function getLink(report: GenericObject, suffix: string, buildUrlFn: Function, baseUrl: string) {
  return buildUrlFn(baseUrl, '/pd/' + report.programme_document.id + '/report/' + report.id + '/' + suffix);
}
