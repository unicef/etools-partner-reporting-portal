function PdDetailsCalculationMethodsUtils() {

};

PdDetailsCalculationMethodsUtils.computeIndicatorsUrl = function(locationId, pdId) {
    return locationId ? App.Endpoints.calculationMethods(locationId, pdId) : '';
};

try {
    module.exports = exports = PdDetailsCalculationMethodsUtils;
} catch (e) {}
