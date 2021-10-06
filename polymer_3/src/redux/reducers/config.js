import { combineReducers } from 'redux';
import Constants from '../../constants';
export class ConfigState {
    constructor() {
        this.data = {};
        this.loading = false;
    }
}
export const Config = combineReducers({
    data: configReducer,
    loading: configLoadingReducer
});
function configReducer(state = {}, action) {
    switch (action.type) {
        case Constants.SET_CONFIG:
            return action.config;
        default:
            return state;
    }
}
function configLoadingReducer(state = false, action) {
    switch (action.type) {
        case Constants.CONFIG_LOADING_START:
            return true;
        case Constants.CONFIG_LOADING_END:
            return false;
        default:
            return state;
    }
}
