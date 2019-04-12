function PdReportsReportTitleUtils () {

}

PdReportsReportTitleUtils.shouldDisplayLink = function (displayLink, report, permissions, fn) {
    return displayLink && fn(permissions, report);
}

PdReportsReportTitleUtils.getReportTitleFull = function (report) {
    var title =  report.report_type + report.report_number;
    if (report.report_type === 'QPR') {
        title += ' (Quarterly Progress Report)';
    } else if (report.report_type === 'HR') {
        title += ' (Humanitarian Report)';
    } else if (report.report_type === 'SR') {
        title += ' (Special Report)';
    }
    return title;
}

try {
    module.exports = exports = PdReportsReportTitleUtils;
} catch (e) {}