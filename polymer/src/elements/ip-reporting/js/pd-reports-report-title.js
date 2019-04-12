function PdReportsReportTitleUtils () {

}

PdReportsReportTitleUtils.shouldDisplayLink = function (displayLink, report, permissions, fn) {
    return displayLink && fn(permissions, report);
}

try {
    module.exports = exports = PdReportsReportTitleUtils;
} catch (e) {}