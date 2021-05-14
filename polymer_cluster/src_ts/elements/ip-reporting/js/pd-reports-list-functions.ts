import {GenericObject} from '../../../typings/globals.types';

export function getLink(
  report: GenericObject,
  suffix: string,
  buildUrlFn: (baseUrl: string, tail: string) => string,
  baseUrl: string
) {
  return buildUrlFn(baseUrl, '/pd/' + report.programme_document.id + '/report/' + report.id + '/' + suffix);
}
