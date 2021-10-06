import { combineReducers } from 'redux';
import Constants from '../../constants';
export class ClusterObjectivesState {
    constructor() {
        this.all = [];
        this.count = 0;
        this.loading = false;
        this.indicators = {};
        this.indicatorsCount = 0;
        this.indicatorsLoading = false;
    }
}
export const ClusterObjectives = combineReducers({
    all: clusterObjectivesListReducer,
    count: clusterObjectivesCountReducer,
    loading: loadingClusterObjectivesReducer,
    indicators: indicatorsByClusterObjectiveIdReducer,
    indicatorsCount: indicatorsByClusterObjectiveIdCountReducer,
    indicatorsLoading: indicatorsByClusterObjectiveIdLoadingReducer
});
function clusterObjectivesListReducer(state = [], action) {
    switch (action.type) {
        case Constants.SET_CLUSTER_OBJECTIVES_LIST:
            return action.data.results;
        case Constants.RESET:
            return [];
        default:
            return state;
    }
}
function clusterObjectivesCountReducer(state = 0, action) {
    switch (action.type) {
        case Constants.SET_CLUSTER_OBJECTIVES_COUNT:
            return action.count;
        default:
            return state;
    }
}
function loadingClusterObjectivesReducer(state = false, action) {
    switch (action.type) {
        case Constants.CLUSTER_OBJECTIVES_LOADING_START:
            return true;
        case Constants.CLUSTER_OBJECTIVES_LOADING_STOP:
            return false;
        default:
            return state;
    }
}
function indicatorsByClusterObjectiveIdReducer(state = {}, action) {
    switch (action.type) {
        case Constants.SET_INDICATORS_BY_CLUSTER_OBJECTIVE_ID:
            return (function () {
                const change = {};
                change[action.clusterObjectiveId] = action.data;
                return Object.assign({}, state, change);
            }());
        case Constants.RESET:
            return {};
        default:
            return state;
    }
}
function indicatorsByClusterObjectiveIdCountReducer(state = 0, action) {
    switch (action.type) {
        case Constants.SET_INDICATORS_BY_CLUSTER_OBJECTIVE_ID_COUNT:
            return (function () {
                const change = {};
                change[action.clusterObjectiveId] = action.count;
                return Object.assign({}, state, change);
            }());
        default:
            return state;
    }
}
function indicatorsByClusterObjectiveIdLoadingReducer(state = false, action) {
    switch (action.type) {
        case Constants.INDICATORS_BY_CLUSTER_OBJECTIVE_ID_LOADING_START:
            return true;
        case Constants.INDICATORS_BY_CLUSTER_OBJECTIVE_ID_LOADING_STOP:
            return false;
        default:
            return state;
    }
}
