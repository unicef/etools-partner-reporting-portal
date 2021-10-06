import { combineReducers } from 'redux';
import Constants from '../../etools-prp-common/constants';
export class ProgrammeDocumentsIndicatorsState {
    constructor() {
        this.byPd = {};
        this.loading = {};
    }
}
export const ProgrammeDocumentsIndicators = combineReducers({
    byPd: byPdReducer,
    loading: loadingByPdReducer
});
function byPdReducer(state = {}, action) {
    switch (action.type) {
        case Constants.SET_PD_INDICATORS:
            return (function () {
                const change = {};
                change[action.pdId] = action.indicatorData;
                return Object.assign({}, state, change);
            })();
        case Constants.RESET:
            return {};
        default:
            return state;
    }
}
function loadingByPdReducer(state = {}, action) {
    switch (action.type) {
        case Constants.SET_PD_INDICATORS_LOADING:
            return (function () {
                const change = {};
                change[action.pdId] = action.loading;
                return Object.assign({}, state, change);
            })();
        case Constants.RESET:
            return {};
        default:
            return state;
    }
}
