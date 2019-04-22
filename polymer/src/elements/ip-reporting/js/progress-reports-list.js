function ProgressReportsListUtils() {

}

ProgressReportsListUtils.getReportTitle = function (report) {
    return report.report_type + report.report_number;
};

try {
    module.exports = exports = ProgressReportsListUtils;
} catch (e) {}
