import Constants from '../../etools-prp-common/constants';
export class CurrenciesDataState {
    constructor() {
        this.currenciesData = [];
    }
}
const INITIAL_STATE = new CurrenciesDataState();
const formatCurrencies = (currencies) => {
    return (currencies || []).map((currency) => {
        return { label: currency[0], value: currency[0] };
    });
};
export const CurrenciesData = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case Constants.SET_CURRENCIES:
            return formatCurrencies(action.currenciesData);
        default:
            return state;
    }
};
