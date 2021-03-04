import {GenericObject} from '../../typings/globals.types';
import Constants from '../../constants';
import {combineReducers} from 'redux';

export class IndicatorsState {
  all = [];
  loading = false;
  loadingDetails = false;
  count = 0;
  details: GenericObject = {};
}

export const Indicators = combineReducers({
  all: allIndicatorsReducer,
  loading: loadingIndicatorsReducer,
  loadingDetails: loadingDetailsReducer,
  count: indicatorsCountReducer,
  details: indicatorDetailsReducer
});

function allIndicatorsReducer(state = [], action: any) {
  switch (action.type) {
    case Constants.SET_INDICATORS:
      return action.indicatorsData.results.slice();
    case Constants.RESET:
      return [];
    default:
      return state;
  }
}

function indicatorsCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_INDICATORS_COUNT:
      return action.count;
    default:
      return state;
  }
}

function loadingIndicatorsReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.INDICATORS_LOADING_START:
      return true;
    case Constants.INDICATORS_LOADING_STOP:
      return false;
    default:
      return state;
  }
}

function loadingDetailsReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.INDICATOR_DETAILS_LOADING_START:
      return true;
    case Constants.INDICATOR_DETAILS_LOADING_STOP:
      return false;
    default:
      return state;
  }
}

function indicatorDetailsReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_INDICATOR_DETAILS: {
      const indicatorKey = Object.keys(action.details)[0];
      // Make a copy of the existing details state.
      const copy = Object.assign({}, (state as any).details);
      // Override any prior data at this key.
      copy[indicatorKey] = action.details[indicatorKey];
      // Add the updated disaggregations state to the full state.
      const fullState = Object.assign({}, state, {
        details: copy
      });
      return fullState;
    }
    default:
      return state;
  }
}
