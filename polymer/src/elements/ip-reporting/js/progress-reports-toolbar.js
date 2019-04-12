function ProgressReportsToolbarUtils() {

}

ProgressReportsToolbarUtils.computePdReportsUrl = function (locationId) {
    return App.Endpoints.programmeDocumentReports(locationId);
}

ProgressReportsToolbarUtils.canExport = function (totalResults) {
    return totalResults > 0;
}

try {
    module.exports = exports = ProgressReportsToolbarUtils;
} catch (e) {}