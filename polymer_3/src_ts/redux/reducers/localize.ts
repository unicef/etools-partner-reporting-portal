import {GenericObject} from '../../typings/globals.types';
import Constants from '../../constants';
import {combineReducers} from 'redux';

let availableLangs: GenericObject;

export class LocaLizeState {
  language: string = "en";
  resources = [];
}

export const Localize = combineReducers({
  language: languageReducer,
  resources: resourcesReducer,
});


function languageReducer(state: string, action: any) {
  const currentLanguage = navigator.language.split('-')[0];
  if (typeof state === 'undefined') {
    state = currentLanguage;
  }

  if (availableLangs !== undefined && !availableLangs.includes(state)) {
    state = 'en';
  }

  switch (action.type) {
    case Constants.SET_LANGUAGE:
      return action.language;

    default:
      return state;
  }
}

function resourcesReducer(state = [], action: any) {
  switch (action.type) {
    case Constants.SET_L11N_RESOURCES:
      availableLangs = Object.keys(action.resources);
      return action.resources;

    default:
      return state;
  }
}
