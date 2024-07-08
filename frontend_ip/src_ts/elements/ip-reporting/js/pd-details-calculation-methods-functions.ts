import Endpoints from '../../../endpoints';

export function computeIndicatorsUrl(locationId: string, pdId: string) {
  return (locationId && pdId) ? Endpoints.calculationMethods(locationId, pdId) : '';
}

export function computeFormattedData(data: any) {
  return data.ll_outputs_and_indicators.reduce((acc: any, curr: any) => {
    acc.push({
      type: 'label',
      text: curr.ll_output.title
    });

    if (!curr.indicators.length) {
      acc.push({
        type: 'missingIndicators',
        text: 'missing_active_indicators'
      });
    }

    const items = (curr.indicators || []).map(function (indicator: any) {
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

export function computeSelected(data: any, scope: string) {
  return ['ratio', 'percentage'].includes(data.display_type) && scope === 'calculation_formula_across_periods'
    ? 'latest'
    : data[scope];
}

export function computeDisabled(display_type: string) {
  return ['percentage', 'ratio'].indexOf(display_type) !== -1;
}

export function onValueChanged(data: any, localData: any) {
  const indices: any = {};

  // Here's what the lack of expression interpolation in polymer makes people do:

  indices.lloIndex = localData.ll_outputs_and_indicators.findIndex(function (item: any) {
    return Number(item.ll_output.id) === Number(data.lloId);
  });

  indices.indicatorIndex = localData.ll_outputs_and_indicators[indices.lloIndex].indicators.findIndex(function (
    item: any
  ) {
    return Number(item.id) === Number(data.id);
  });

  return indices;
}

export function canEdit(item: any, permissions: any) {
  return item.data.editable && permissions && permissions.changeProgrammeDocumentCalculationMethod;
}

export function canSave(permissions: any) {
  return permissions && permissions.changeProgrammeDocumentCalculationMethod;
}
