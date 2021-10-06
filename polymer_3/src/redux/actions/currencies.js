import Constants from '../../etools-prp-common/constants';
export const setCurrenciesData = function (currenciesData) {
    return {
        type: Constants.SET_CURRENCIES,
        currenciesData: currenciesData
    };
};
export const fetchCurrencies = function (currenciesDataThunk) {
    return function (dispatch) {
        return currenciesDataThunk().then(function (res) {
            dispatch(setCurrenciesData(res.data));
        });
    };
};
