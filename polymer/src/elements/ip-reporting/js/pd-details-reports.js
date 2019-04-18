function PdDetailsReportsUtils() {

};

PdDetailsReportsUtils.computePDReportsUrl = function(locationId) {
    return locationId ? App.Endpoints.programmeDocumentReports(locationId) : '';
};

try {
    module.exports = exports = PdDetailsReportsUtils;
} catch (e) {}
