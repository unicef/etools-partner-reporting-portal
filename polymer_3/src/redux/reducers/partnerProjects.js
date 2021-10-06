import { combineReducers } from 'redux';
import Constants from '../../constants';
export class PartnerProjectsState {
    constructor() {
        this.all = [];
        this.count = 0;
        this.loading = false;
        this.activities = {};
        this.activitiesCount = 0;
        this.activitiesLoading = false;
        this.indicators = {};
        this.indicatorsCount = 0;
        this.indicatorsLoading = false;
    }
}
export const PartnerProjects = combineReducers({
    all: partnerProjectsListReducer,
    count: partnerProjectsCountReducer,
    loading: loadingPartnerProjectsReducer,
    activities: activitiesByPartnerProjectIdReducer,
    activitiesCount: activitiesByPartnerProjectIdCountReducer,
    activitiesLoading: activitiesByPartnerProjectIdLoadingReducer,
    indicators: indicatorsReducer,
    indicatorsCount: indicatorsCountReducer,
    indicatorsLoading: indicatorsLoadingReducer
});
function partnerProjectsListReducer(state = [], action) {
    switch (action.type) {
        case Constants.SET_PARTNER_PROJECTS_LIST:
            return action.data.results;
        case Constants.RESET:
            return [];
        default:
            return state;
    }
}
function partnerProjectsCountReducer(state = 0, action) {
    switch (action.type) {
        case Constants.SET_PARTNER_PROJECTS_COUNT:
            return action.count;
        default:
            return state;
    }
}
function loadingPartnerProjectsReducer(state = false, action) {
    switch (action.type) {
        case Constants.PARTNER_PROJECTS_LOADING_START:
            return true;
        case Constants.PARTNER_PROJECTS_LOADING_STOP:
            return false;
        default:
            return state;
    }
}
// Activities
function activitiesByPartnerProjectIdReducer(state = {}, action) {
    switch (action.type) {
        case Constants.SET_ACTIVITIES_BY_PARTNER_PROJECT_ID:
            return (function () {
                const change = {};
                change[action.partnerProjectId] = action.data;
                return Object.assign({}, state, change);
            }());
        case Constants.RESET:
            return {};
        default:
            return state;
    }
}
function activitiesByPartnerProjectIdCountReducer(state = 0, action) {
    switch (action.type) {
        case Constants.SET_ACTIVITIES_BY_PARTNER_PROJECT_ID_COUNT:
            return (function () {
                const change = {};
                change[action.partnerProjectId] = action.count;
                return Object.assign({}, state, change);
            }());
        default:
            return state;
    }
}
function activitiesByPartnerProjectIdLoadingReducer(state = false, action) {
    switch (action.type) {
        case Constants.ACTIVITIES_BY_PARTNER_PROJECT_ID_LOADING_START:
            return true;
        case Constants.ACTIVITIES_BY_PARTNER_PROJECT_ID_LOADING_STOP:
            return false;
        default:
            return state;
    }
}
function indicatorsReducer(state = {}, action) {
    switch (action.type) {
        case Constants.SET_INDICATORS_BY_PARTNER_PROJECT_ID:
            return (function () {
                const change = {};
                change[action.partnerProjectId] = action.data;
                return Object.assign({}, state, change);
            }());
        case Constants.RESET:
            return {};
        default:
            return state;
    }
}
function indicatorsCountReducer(state = 0, action) {
    switch (action.type) {
        case Constants.SET_INDICATORS_BY_PARTNER_PROJECT_ID_COUNT:
            return (function () {
                const change = {};
                change[action.partnerProjectId] = action.count;
                return Object.assign({}, state, change);
            }());
        default:
            return state;
    }
}
function indicatorsLoadingReducer(state = false, action) {
    switch (action.type) {
        case Constants.INDICATORS_BY_PARTNER_PROJECT_ID_LOADING_START:
            return true;
        case Constants.INDICATORS_BY_PARTNER_PROJECT_ID_LOADING_STOP:
            return false;
        default:
            return state;
    }
}
