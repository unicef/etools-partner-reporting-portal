import {GenericObject} from '../../typings/globals.types';
import Constants from '../../constants';
import {combineReducers} from 'redux';

let availableLangs: GenericObject;
const defaultLanguage = 'en';

export class LocaLizeState {
  language: string = defaultLanguage;
  resources = [];
}

export const Localize = combineReducers({
  language: languageReducer,
  resources: resourcesReducer
});

function languageReducer(state: string, action: any) {
  if (typeof state === 'undefined') {
    let currentLanguage = localStorage.getItem('defaultLanguage');
    if (!currentLanguage) {
      currentLanguage = navigator.language.split('-')[0];
    }
    state = currentLanguage;
  }

  if (availableLangs !== undefined && !availableLangs.includes(state)) {
    state = defaultLanguage;
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
