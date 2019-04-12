function PdReportsToolbarUtils() {

}

PdReportsToolbarUtils.computePdReportsUrl = function (locationId) {
    return App.Endpoints.programmeDocumentReports(locationId);
}

try {
    module.exports = exports = PdReportsToolbarUtils;
} catch (e) {}