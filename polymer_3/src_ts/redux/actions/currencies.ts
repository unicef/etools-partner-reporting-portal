import Constants from '../../constants';

export const setCurrenciesData = function (currenciesData: any) {
  return {
    type: Constants.SET_CURRENCIES,
    currenciesData: currenciesData
  };
};

export const fetchCurrencies = function (currenciesDataThunk: any) {
  return function (dispatch: any) {
    return currenciesDataThunk().then(function (res: any) {
      dispatch(setCurrenciesData(res.data));
    });
  };
};
