function IndicatorsToolbarUtils() {

};

IndicatorsToolbarUtils.computeIndicatorsUrl = function(locationId) {
    return App.Endpoints.allPDIndicators(locationId);
};

try {
    module.exports = exports = IndicatorsToolbarUtils;
} catch (e) {}
