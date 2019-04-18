function PdDetailsCalculationMethodsUtils() {

};

PdDetailsCalculationMethodsUtils.computeIndicatorsUrl = function(locationId, pdId) {
    return locationId ? App.Endpoints.calculationMethods(locationId, pdId) : '';
};

PdDetailsCalculationMethodsUtils.computeFormattedData = function(data) {
    return data.ll_outputs_and_indicators.reduce(function (acc, curr) {
        var items;

        acc.push({
            type: 'label',
            text: curr.ll_output.title,
        });

        items = curr.indicators.map(function (indicator) {
            return {
                type: 'data',
                data: Object.assign({}, indicator, {
                    editable: true,
                }),
                llo_id: curr.ll_output.id,
            };
        });

        acc.push.apply(acc, items);

        return acc;
    }, []);
};

PdDetailsCalculationMethodsUtils.computeSelected = function(data, scope) {
    return data[scope];
};

PdDetailsCalculationMethodsUtils.computeDisabled = function(display_type) {
    return ['percentage', 'ratio'].indexOf(display_type) !== -1;
};

PdDetailsCalculationMethodsUtils.onValueChanged = function(data, localData) {
    var indices = {};

    // Here's what the lack of expression interpolation in polymer makes people do:

    indices.lloIndex = localData.ll_outputs_and_indicators
        .findIndex(function (item) {
            return Number(item.ll_output.id) === Number(data.lloId);
        });

    indices.indicatorIndex = localData.ll_outputs_and_indicators[indices.lloIndex].indicators
        .findIndex(function (item) {
            return Number(item.id) === Number(data.id);
        });
    
    return indices;
};

PdDetailsCalculationMethodsUtils.canEdit = function(item, permissions) {
    return item.data.editable &&
        permissions.changeProgrammeDocumentCalculationMethod;
};

PdDetailsCalculationMethodsUtils.canSave = function(permissions) {
    return permissions.changeProgrammeDocumentCalculationMethod;
};

try {
    module.exports = exports = PdDetailsCalculationMethodsUtils;
} catch (e) {}
