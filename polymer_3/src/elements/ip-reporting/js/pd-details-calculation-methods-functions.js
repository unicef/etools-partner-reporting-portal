import Endpoints from '../../../endpoints';
export function computeIndicatorsUrl(locationId, pdId) {
    return locationId ? Endpoints.calculationMethods(locationId, pdId) : '';
}
export function computeFormattedData(data) {
    return data.ll_outputs_and_indicators.reduce((acc, curr) => {
        acc.push({
            type: 'label',
            text: curr.ll_output.title
        });
        const items = curr.indicators.map(function (indicator) {
            return {
                type: 'data',
                data: Object.assign({}, indicator, {
                    editable: true
                }),
                llo_id: curr.ll_output.id
            };
        });
        acc.push(...items);
        return acc;
    }, []);
}
export function computeSelected(data, scope) {
    return data[scope];
}
export function computeDisabled(display_type) {
    return ['percentage', 'ratio'].indexOf(display_type) !== -1;
}
export function onValueChanged(data, localData) {
    const indices = {};
    // Here's what the lack of expression interpolation in polymer makes people do:
    indices.lloIndex = localData.ll_outputs_and_indicators.findIndex(function (item) {
        return Number(item.ll_output.id) === Number(data.lloId);
    });
    indices.indicatorIndex = localData.ll_outputs_and_indicators[indices.lloIndex].indicators.findIndex(function (item) {
        return Number(item.id) === Number(data.id);
    });
    return indices;
}
export function canEdit(item, permissions) {
    return item.data.editable && permissions && permissions.changeProgrammeDocumentCalculationMethod;
}
export function canSave(permissions) {
    return permissions && permissions.changeProgrammeDocumentCalculationMethod;
}
