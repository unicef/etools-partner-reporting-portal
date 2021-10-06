import { combineReducers } from 'redux';
import Constants from '../../constants';
export class AnalysisState {
    constructor() {
        this.operationalPresence = {
            data: {},
            dataLoading: false,
            map: {
                type: 'FeatureCollection',
                features: []
            },
            mapLoading: false
        };
        this.indicators = {
            data: [],
            dataLoading: false,
            indicatorData: {
                byId: {},
                loadingById: {}
            }
        };
    }
}
export const Analysis = combineReducers({
    operationalPresence: combineReducers({
        data: operationalPresenceDataReducer,
        dataLoading: operationalPresenceDataLoadingReducer,
        map: operationalPresenceMapReducer,
        mapLoading: operationalPresenceMapLoadingReducer
    }),
    indicators: combineReducers({
        data: indicatorsDataReducer,
        dataLoading: indicatorsDataLoadingReducer,
        indicatorData: combineReducers({
            byId: indicatorDataByIdReducer,
            loadingById: indicatorDataLoadingByIdReducer
        })
    })
});
function operationalPresenceDataReducer(state = {}, action) {
    switch (action.type) {
        case Constants.SET_OPERATIONAL_PRESENCE_DATA:
            return action.data;
        default:
            return state;
    }
}
function operationalPresenceDataLoadingReducer(state = false, action) {
    switch (action.type) {
        case Constants.OPERATIONAL_PRESENCE_DATA_LOADING_START:
            return true;
        case Constants.OPERATIONAL_PRESENCE_DATA_LOADING_STOP:
            return false;
        default:
            return state;
    }
}
function operationalPresenceMapReducer(state, action) {
    if (typeof state === 'undefined') {
        state = {
            type: 'FeatureCollection',
            features: []
        };
    }
    switch (action.type) {
        case Constants.SET_OPERATIONAL_PRESENCE_MAP:
            return action.map;
        default:
            return state;
    }
}
function operationalPresenceMapLoadingReducer(state = false, action) {
    switch (action.type) {
        case Constants.OPERATIONAL_PRESENCE_MAP_LOADING_START:
            return true;
        case Constants.OPERATIONAL_PRESENCE_MAP_LOADING_STOP:
            return false;
        default:
            return state;
    }
}
function indicatorsDataReducer(state = [], action) {
    switch (action.type) {
        case Constants.SET_ANALYSIS_INDICATORS_DATA:
            return action.data;
        default:
            return state;
    }
}
function indicatorsDataLoadingReducer(state = false, action) {
    switch (action.type) {
        case Constants.ANALYSIS_INDICATORS_DATA_LOADING_START:
            return true;
        case Constants.ANALYSIS_INDICATORS_DATA_LOADING_STOP:
            return false;
        default:
            return state;
    }
}
function indicatorDataByIdReducer(state = {}, action) {
    switch (action.type) {
        case Constants.SET_ANALYSIS_INDICATOR_DATA:
            return (function () {
                const change = {};
                change[action.indicatorId] = action.data;
                return Object.assign({}, state, change);
            }());
        default:
            return state;
    }
}
function indicatorDataLoadingByIdReducer(state = {}, action) {
    switch (action.type) {
        case Constants.ANALYSIS_INDICATOR_DATA_LOADING_START:
            return (function () {
                const change = {};
                change[action.indicatorId] = true;
                return Object.assign({}, state, change);
            }());
        case Constants.ANALYSIS_INDICATOR_DATA_LOADING_STOP:
            return (function () {
                const change = {};
                change[action.indicatorId] = false;
                return Object.assign({}, state, change);
            }());
        default:
            return state;
    }
}
