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

try {
    module.exports = exports = PdReportInfoUtils;
} catch (e) {}
