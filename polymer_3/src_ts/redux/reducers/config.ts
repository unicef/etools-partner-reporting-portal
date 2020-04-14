import {combineReducers} from 'redux';
import {GenericObject} from '../../typings/globals.types';
import Constants from '../../constants';

export class ConfigState {
  data: GenericObject = {};
  loading = false;
}

export const Config = combineReducers({
  data: configReducer,
  loading: configLoadingReducer
});

function configReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_CONFIG:
      return action.config;

    default:
      return state;
  }
}

function configLoadingReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.CONFIG_LOADING_START:
      return true;

    case Constants.CONFIG_LOADING_END:
      return false;

    default:
      return state;
  }
}
