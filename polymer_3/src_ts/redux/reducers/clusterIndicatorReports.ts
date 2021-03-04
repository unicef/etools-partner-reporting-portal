import {combineReducers} from 'redux';
import Constants from '../../constants';
import {GenericObject} from '../../typings/globals.types';

export class ClusterIndicatorReportsState {
  byId: GenericObject = {};
  allIds = [];
  count = 0;
  loading = false;
}

export const ClusterIndicatorReports = combineReducers({
  byId: reportsByIdReducer,
  allIds: allIdsReducer,
  count: reportsCountReducer,
  loading: loadingReducer
});

function reportsByIdReducer(state: GenericObject = {}, action: any) {
  switch (action.type) {
    case Constants.SET_CLUSTER_INDICATOR_REPORTS:
      return action.data.reduce(function (prev: any, curr: any) {
        prev[curr.id] = curr;

        return prev;
      }, {});

    case Constants.UPDATE_CLUSTER_INDICATOR_REPORT:
      return (function () {
        const change: GenericObject = {};

        change[action.reportId] = Object.assign({}, state[action.reportId], action.data);

        return Object.assign({}, state, change);
      })();

    case Constants.RESET:
      return {};

    default:
      return state;
  }
}

function allIdsReducer(state = [], action: any) {
  switch (action.type) {
    case Constants.SET_CLUSTER_INDICATOR_REPORTS:
      return action.data.map(function (report: GenericObject) {
        return report.id;
      });

    case Constants.RESET:
      return [];

    default:
      return state;
  }
}

function reportsCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_CLUSTER_INDICATOR_REPORTS_COUNT:
      return action.count;

    case Constants.RESET:
      return 0;

    default:
      return state;
  }
}

function loadingReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.CLUSTER_INDICATOR_REPORTS_LOADING_START:
      return true;

    case Constants.CLUSTER_INDICATOR_REPORTS_LOADING_STOP:
      return false;

    default:
      return state;
  }
}
