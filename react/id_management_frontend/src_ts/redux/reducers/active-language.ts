import {SET_LANGUAGE} from '../actions/active-language';

export interface ActiveLanguageState {
  activeLanguage: string;
}

const INITIAL_STATE: ActiveLanguageState = {
  activeLanguage: localStorage.getItem('defaultLanguage') || 'en'
};

export const activeLanguage = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case SET_LANGUAGE:
      return {...state, activeLanguage: action.payload};
    default:
      return state;
  }
};
