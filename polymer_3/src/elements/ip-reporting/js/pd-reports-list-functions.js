export function getLink(report, suffix, buildUrlFn, baseUrl) {
    return buildUrlFn(baseUrl, '/pd/' + report.programme_document.id + '/report/' + report.id + '/' + suffix);
}
