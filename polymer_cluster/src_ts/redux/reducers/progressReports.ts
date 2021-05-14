import {combineReducers} from 'redux';
import Constants from '../../constants';

export class ProgressReportsState {
  all = [];
  count = 0;
  loading = false;
}

export const ProgressReports = combineReducers({
  all: allProgressReportsReducer,
  count: ProgressReportsCountReducer,
  loading: loadingProgressReportsReducer
});

function allProgressReportsReducer(state = [], action: any) {
  switch (action.type) {
    case Constants.SET_PROGRESS_REPORTS:
      return action.data.slice();

    case Constants.RESET:
      return [];

    default:
      return state;
  }
}

function ProgressReportsCountReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.SET_PROGRESS_REPORTS_COUNT:
      return action.count;

    default:
      return state;
  }
}

function loadingProgressReportsReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.PROGRESS_REPORTS_LOADING_START:
      return true;

    case Constants.PROGRESS_REPORTS_LOADING_STOP:
      return false;

    default:
      return state;
  }
}
