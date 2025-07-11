import Constants from '../../etools-prp-common/constants';

export class CurrenciesDataState {
  currenciesData: any[] = [];
}

const INITIAL_STATE = new CurrenciesDataState();

const formatCurrencies = (currencies: any[]) => {
  return (currencies || []).map((currency: any[]) => {
    return {label: currency[0], value: currency[0]};
  });
};

export const CurrenciesData = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case Constants.SET_CURRENCIES:
      return {...state, currenciesData: formatCurrencies(action.currenciesData)};

    default:
      return state;
  }
};
