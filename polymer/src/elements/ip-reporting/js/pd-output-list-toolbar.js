function PdOutputListToolbarUtils() {

}

PdOutputListToolbarUtils.computeImportTemplateUrl = function(locationId, reportId) {
    return App.Endpoints.programmeDocumentImportTemplate(locationId, reportId);
};

PdOutputListToolbarUtils.computeImportUrl = function(locationId, reportId) {
    return App.Endpoints.programmeDocumentImport(locationId, reportId);
};

PdOutputListToolbarUtils.computePdReportUrl = function(locationId, reportId) {
    return App.Endpoints.programmeDocumentReport(locationId, reportId);
};

try {
    module.exports = exports = PdOutputListToolbarUtils;
} catch (e) {}
