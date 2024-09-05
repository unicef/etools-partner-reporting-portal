export function getLink(
  report: any,
  suffix: string,
  buildUrlFn: (baseUrl: string, tail: string) => string,
  baseUrl: string
) {
  return buildUrlFn(baseUrl, '/pd/' + report.programme_document.id + '/report/' + report.id + '/' + suffix);
}
