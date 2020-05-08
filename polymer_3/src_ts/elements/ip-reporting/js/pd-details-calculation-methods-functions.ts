import Endpoints from '../../../endpoints';
import {GenericObject} from '../../../typings/globals.types';

export function computeIndicatorsUrl(locationId: string, pdId: string) {
  return locationId ? Endpoints.calculationMethods(locationId, pdId) : '';
}

export function computeFormattedData(data: GenericObject) {
  return data.ll_outputs_and_indicators.reduce((acc: GenericObject, curr: GenericObject) => {

    acc.push({
      type: 'label',
      text: curr.ll_output.title
    });

    let items = curr.indicators.map(function(indicator: GenericObject) {
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

export function computeSelected(data: GenericObject, scope: string) {
  return data[scope];
}

export function computeDisabled(display_type: string) {
  return ['percentage', 'ratio'].indexOf(display_type) !== -1;
}

export function onValueChanged(data: GenericObject, localData: GenericObject) {
  const indices: GenericObject = {};

  // Here's what the lack of expression interpolation in polymer makes people do:

  indices.lloIndex = localData.ll_outputs_and_indicators
    .findIndex(function(item: GenericObject) {
      return Number(item.ll_output.id) === Number(data.lloId);
    });

  indices.indicatorIndex = localData.ll_outputs_and_indicators[indices.lloIndex].indicators
    .findIndex(function(item: GenericObject) {
      return Number(item.id) === Number(data.id);
    });

  return indices;
}

export function canEdit(item: GenericObject, permissions: GenericObject) {
  return item.data.editable && permissions &&
    permissions.changeProgrammeDocumentCalculationMethod;
}

export function canSave(permissions: GenericObject) {
  return permissions && permissions.changeProgrammeDocumentCalculationMethod;
}
