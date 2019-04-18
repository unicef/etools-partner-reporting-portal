function PdDetailsDocDownloadUtils() {

};

PdDetailsDocDownloadUtils.computeDocUrl = function(locationId, pdId) {
    return pdId ? App.Endpoints.programmeDocumentDocDownload(locationId, pdId) : '';
};

try {
    module.exports = exports = PdDetailsDocDownloadUtils;
} catch (e) {}
