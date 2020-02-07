import {GenericObject} from '../../../typings/globals.types';
import Constants from '../../../constants';

let availableLangs: GenericObject;

export class LocaLizeState {
  language: string = "en";
  resources = [];

  constructor() {
    var currentLanguage = navigator.language.split('-')[0];
    if (typeof this.language === 'undefined') {
      this.language = currentLanguage;
    }

    if (availableLangs !== undefined && !availableLangs.includes(this.language)) {
      this.language = 'en';
    }
  }
}

const INITIAL_STATE = new LocaLizeState();

export const Localize = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case Constants.SET_LANGUAGE:
      return {
        ...state,
        language: action.language
      };
    case Constants.SET_L11N_RESOURCES:
      availableLangs = Object.keys(action.resources);
      return {
        ...state,
        resources: action.resources
      };

    default:
      return state;
  }
}
