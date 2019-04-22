function PdListToolbarUtils() {

}

PdListToolbarUtils.computePdUrl = function(locationId) {
    return App.Endpoints.programmeDocuments(locationId);
};

try {
    module.exports = exports = PdListToolbarUtils;
} catch (e) {}
