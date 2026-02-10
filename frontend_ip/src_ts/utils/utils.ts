export const _toPercentage = (value: any) => {
  return value == null ? value : Math.floor(value * 100) + '%';
};

export const formatIndicatorValue = (indicatorType: string, value: any, percentize?: any) => {
  if (value == null) {
    return value;
  }

  const _value = value.toFixed(2);

  switch (indicatorType) {
    case 'percentage':
      if (!percentize) {
        return _toPercentage(value);
      }
      return percentize === 1 ? Math.floor(_value) + '%' : _value + '%';
    case 'ratio':
      return _value + '/1';
    default:
      return _value;
  }
};
