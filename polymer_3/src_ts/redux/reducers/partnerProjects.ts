import {combineReducers} from 'redux';
import Constants from '../../constants';
import {GenericObject} from '../../typings/globals.types';

export class PartnerProjectsState {
  all = [];
  count = 0;
  loading = false;
  activities: GenericObject = {};
  activitiesCount = 0;
  activitiesLoading = false;
  indicators: GenericObject = {};
  indicatorsCount = 0;
  indicatorsLoading = false;
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

function partnerProjectsListReducer(state = [], action: any) {
  switch (action.type) {
    case Constants.SET_PARTNER_PROJECTS_LIST:
      return action.data.results;

    case Constants.RESET:
      return [];

    default:
      return state;
  }
}

function partnerProjectsCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_PARTNER_PROJECTS_COUNT:
      return action.count;

    default:
      return state;
  }
}

function loadingPartnerProjectsReducer(state = false, action: any) {
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

function activitiesByPartnerProjectIdReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_ACTIVITIES_BY_PARTNER_PROJECT_ID:
      return (function () {
        const change: GenericObject = {};

        change[action.partnerProjectId] = action.data;
        return Object.assign({}, state, change);
      })();

    case Constants.RESET:
      return {};

    default:
      return state;
  }
}

function activitiesByPartnerProjectIdCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_ACTIVITIES_BY_PARTNER_PROJECT_ID_COUNT:
      return (function () {
        const change: GenericObject = {};
        change[action.partnerProjectId] = action.count;
        return Object.assign({}, state, change);
      })();

    default:
      return state;
  }
}

function activitiesByPartnerProjectIdLoadingReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.ACTIVITIES_BY_PARTNER_PROJECT_ID_LOADING_START:
      return true;

    case Constants.ACTIVITIES_BY_PARTNER_PROJECT_ID_LOADING_STOP:
      return false;

    default:
      return state;
  }
}

function indicatorsReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_INDICATORS_BY_PARTNER_PROJECT_ID:
      return (function () {
        const change: GenericObject = {};

        change[action.partnerProjectId] = action.data;
        return Object.assign({}, state, change);
      })();

    case Constants.RESET:
      return {};

    default:
      return state;
  }
}

function indicatorsCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_INDICATORS_BY_PARTNER_PROJECT_ID_COUNT:
      return (function () {
        const change: GenericObject = {};

        change[action.partnerProjectId] = action.count;
        return Object.assign({}, state, change);
      })();

    default:
      return state;
  }
}

function indicatorsLoadingReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.INDICATORS_BY_PARTNER_PROJECT_ID_LOADING_START:
      return true;

    case Constants.INDICATORS_BY_PARTNER_PROJECT_ID_LOADING_STOP:
      return false;

    default:
      return state;
  }
}
