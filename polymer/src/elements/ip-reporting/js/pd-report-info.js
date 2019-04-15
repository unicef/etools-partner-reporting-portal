function PdReportInfoUtils() {
    
}

PdReportInfoUtils.handleInput = function (inputs, fieldPartner, fieldChallenges, fieldProposed) {
    return inputs.map(function(inputContainer) {
        var field = inputContainer.querySelector('input');

        if (field.value.trim() === fieldPartner
        || field.value.trim() === fieldChallenges
        || field.value.trim() === fieldProposed) {
            return;
        } else {
            return field;
        }
    });
};

PdReportInfoUtils.computeUpdateUrl = function (locationId, reportId) {
    return App.Endpoints.programmeDocumentReportUpdate(locationId, reportId);
};

try {
    module.exports = exports = PdReportInfoUtils;
} catch (e) {}
