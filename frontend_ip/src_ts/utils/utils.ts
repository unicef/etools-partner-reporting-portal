export const _toPercentage = (value: any) => {
  return value == null ? value : Math.floor(value * 100) + '%';
};

export const displayIndicatorValueFromatted = (indicatorType: string, value: any, percentize?: any) => {
  if (value == null) {
    return value;
  }

  const _value = value.toFixed(2);

  switch (indicatorType) {
    case 'percentage':
      if (!percentize) {
        return _toPercentage(value);
      }
      return Math.floor(_value) + '%';
    case 'ratio':
      return _value + '/1';
    default:
      return _value;
  }
};
