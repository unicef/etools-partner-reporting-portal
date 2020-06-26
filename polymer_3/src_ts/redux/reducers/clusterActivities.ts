import {combineReducers} from 'redux';
import Constants from '../../constants';
import {GenericObject} from '../../typings/globals.types';

export class ClusterActivitiesState {
  all = [];
  count = 0;
  loading = false;
  partners: GenericObject = {};
  partnersCount = 0;
  partnersLoading = false;
  indicators: GenericObject = {};
  indicatorsCount = 0;
  indicatorsLoading = false;
}

export const ClusterActivities = combineReducers({
  all: clusterActivitiesListReducer,
  count: clusterActivitiesCountReducer,
  loading: loadingClusterActivitiesReducer,
  partners: partnersByClusterActivityIdReducer,
  partnersCount: partnersByClusterActivityIdCountReducer,
  partnersLoading: partnersByClusterActivityIdLoadingReducer,
  indicators: indicatorsByClusterActivityIdReducer,
  indicatorsCount: indicatorsByClusterActivityIdCountReducer,
  indicatorsLoading: indicatorsByClusterActivityIdLoadingReducer
});

function clusterActivitiesListReducer(state = [], action: any) {
  switch (action.type) {
    case Constants.SET_CLUSTER_ACTIVITIES_LIST:
      return action.data.results;

    case Constants.RESET:
      return [];

    default:
      return state;
  }
}

function clusterActivitiesCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_CLUSTER_ACTIVITIES_COUNT:
      return action.count;

    default:
      return state;
  }
}

function loadingClusterActivitiesReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.CLUSTER_ACTIVITIES_LOADING_START:
      return true;

    case Constants.CLUSTER_ACTIVITIES_LOADING_STOP:
      return false;

    default:
      return state;
  }
}

function partnersByClusterActivityIdReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_PARTNERS_BY_CLUSTER_ACTIVITY_ID:
      return (function () {
        const change: GenericObject = {};

        change[action.clusterActivityId] = action.data;
        return Object.assign({}, state, change);
      })();

    case Constants.RESET:
      return {};

    default:
      return state;
  }
}

function partnersByClusterActivityIdCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_PARTNERS_BY_CLUSTER_ACTIVITY_ID_COUNT:
      return (function () {
        const change: GenericObject = {};

        change[action.clusterActivityId] = action.count;
        return Object.assign({}, state, change);
      })();

    default:
      return state;
  }
}

function partnersByClusterActivityIdLoadingReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.PARTNERS_BY_CLUSTER_ACTIVITY_ID_LOADING_START:
      return true;

    case Constants.PARTNERS_BY_CLUSTER_ACTIVITY_ID_LOADING_STOP:
      return false;

    default:
      return state;
  }
}

function indicatorsByClusterActivityIdReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_INDICATORS_BY_CLUSTER_ACTIVITY_ID:
      return (function () {
        const change: GenericObject = {};

        change[action.clusterActivityId] = action.data;
        return Object.assign({}, state, change);
      })();

    case Constants.RESET:
      return {};

    default:
      return state;
  }
}

function indicatorsByClusterActivityIdCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_INDICATORS_BY_CLUSTER_ACTIVITY_ID_COUNT:
      return (function () {
        const change: GenericObject = {};

        change[action.clusterActivityId] = action.count;
        return Object.assign({}, state, change);
      })();

    default:
      return state;
  }
}

function indicatorsByClusterActivityIdLoadingReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.INDICATORS_BY_CLUSTER_ACTIVITY_ID_LOADING_START:
      return true;

    case Constants.INDICATORS_BY_CLUSTER_ACTIVITY_ID_LOADING_STOP:
      return false;

    default:
      return state;
  }
}
