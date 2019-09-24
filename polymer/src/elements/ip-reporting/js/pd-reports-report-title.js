function PdReportsReportTitleUtils() {

}

PdReportsReportTitleUtils.shouldDisplayLink = function (displayLink, report, permissions, fn) {
    return displayLink && fn(permissions, report);
};

PdReportsReportTitleUtils.getReportTitleFull = function (report, localize) {
    var title = '';
    if (report.report_type === 'QPR') {
        title += localize('qpr_short') + report.report_number + ' ' + localize('qpr_long');
    } else if (report.report_type === 'HR') {
        title += localize('hr_short') + report.report_number + ' ' + localize('hr_long');
    } else if (report.report_type === 'SR') {
        title += localize('sr_short') + report.report_number + ' ' + localize('sr_long');
    }
    return title;
};

PdReportsReportTitleUtils.getReportTitle = function (report, localize) {
    var title = '';
    if (report.report_type === 'QPR') {
        title += localize('qpr_short') + report.report_number;
    } else if (report.report_type === 'HR') {
        title += localize('hr_short') + report.report_number;
    } else if (report.report_type === 'SR') {
        title += localize('sr_short') + report.report_number;
    }
    return title;
};

PdReportsReportTitleUtils.getReportLink = function (report, suffix, buildUrlFn, baseUrl) {
    return buildUrlFn(
        baseUrl,
        '/pd/' + report.programme_document.id + '/report/' + report.id + '/' + suffix
    );
};

try {
    module.exports = exports = PdReportsReportTitleUtils;
} catch (e) {}
