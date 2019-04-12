function PdReportsToolbarUtils() {

}

PdReportsToolbarUtils.computePdReportsUrl = function (locationId) {
    return App.Endpoints.programmeDocumentReports(locationId);
}

PdReportsToolbarUtils.canExport = function (totalResults) {
    return totalResults > 0;
}

PdReportsToolbarUtils.computePdQuery = function (pdId) {
    return {
        programme_document: pdId,
    };
}

try {
    module.exports = exports = PdReportsToolbarUtils;
} catch (e) {}