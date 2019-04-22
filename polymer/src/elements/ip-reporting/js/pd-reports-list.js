function PdReportsListUtils() {

}

PdReportsListUtils.getLink = function (report, suffix, buildUrlFn, baseUrl) {
    return buildUrlFn(
        baseUrl,
        '/pd/' + report.programme_document.id + '/report/' + report.id + '/' + suffix
    );
};

try {
    module.exports = exports = PdReportsListUtils;
} catch (e) {}
