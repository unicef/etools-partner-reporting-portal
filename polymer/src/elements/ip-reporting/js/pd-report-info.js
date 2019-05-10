function PdReportInfoUtils() {
    
}

PdReportInfoUtils.computeUpdateUrl = function (locationId, reportId) {
    return App.Endpoints.programmeDocumentReportUpdate(locationId, reportId);
};

PdReportInfoUtils.computeMode = function (mode, overrideMode, report, permissions) {
    return permissions.savePdReport ? (overrideMode || mode) : 'view';
};

try {
    module.exports = exports = PdReportInfoUtils;
} catch (e) {}
