function PdReportInfoUtils() {
    
}

// No unit test for this one because it involves DOM manipulation
// and not currently sure how to implement that in Jasmine
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

PdReportInfoUtils.computeMode = function (mode, overrideMode, report, permissions) {
    return permissions.savePdReport ? (overrideMode || mode) : 'view';
};

try {
    module.exports = exports = PdReportInfoUtils;
} catch (e) {}
