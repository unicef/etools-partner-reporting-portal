import {combineReducers} from 'redux';
import Constants from '../../constants';
import {GenericObject} from '../../typings/globals.types';

export class ClusterDashboardDataState {
  data: GenericObject = {};
  loading = false;
}

export const ClusterDashboardData = combineReducers({
  data: dataReducer,
  loading: loadingReducer
});

function dataReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_CLUSTER_DASHBOARD_DATA:
      return Object.assign({}, action.data);

    case Constants.RESET:
      return {};

    default:
      return state;
  }
}

function loadingReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.CLUSTER_DASHBOARD_DATA_LOADING_START:
      return true;

    case Constants.CLUSTER_DASHBOARD_DATA_LOADING_STOP:
      return false;

    default:
      return state;
  }
}
