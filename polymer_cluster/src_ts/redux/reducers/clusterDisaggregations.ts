import {combineReducers} from 'redux';
import Constants from '../../constants';

export class ClusterDisaggregationsState {
  all = [];
  count = 0;
  loading = false;
}

export const ClusterDisaggregations = combineReducers({
  all: clusterDisaggregationsListReducer,
  count: clusterDisaggregationsCountReducer,
  loading: loadingClusterDisaggregationsReducer
});

function clusterDisaggregationsListReducer(state = [], action: any) {
  switch (action.type) {
    case Constants.SET_CLUSTER_DISAGGREGATIONS_LIST:
      return action.data.results;

    case Constants.RESET:
      return [];

    default:
      return state;
  }
}

function clusterDisaggregationsCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_CLUSTER_DISAGGREGATIONS_COUNT:
      return action.count;

    default:
      return state;
  }
}

function loadingClusterDisaggregationsReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.CLUSTER_DISAGGREGATIONS_LOADING_START:
      return true;

    case Constants.CLUSTER_DISAGGREGATIONS_LOADING_STOP:
      return false;

    default:
      return state;
  }
}
