function PdDetailsReportingRequirementsUtils() {

}

PdDetailsReportingRequirementsUtils.getReportName = function(type, index, localize) {
    return localize(type.toLowerCase()).split(' ')[0] + (index + 1);
};

try {
    module.exports = exports = PdDetailsReportingRequirementsUtils;
} catch (e) {}
