function PdDetailsReportsUtils() {

};

PdDetailsReportsUtils.computePDReportsUrl = function(locationId) {
    return locationId ? App.Endpoints.programmeDocumentReports(locationId) : '';
};

PdDetailsReportsUtils.computePDReportsParams = function(pdId, queryParams) {
    return Object.assign({}, queryParams, {
        programme_document: pdId,
    });
};

try {
    module.exports = exports = PdDetailsReportsUtils;
} catch (e) {}
