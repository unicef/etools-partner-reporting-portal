import {ActionCreator, Action} from 'redux';
export const SET_LANGUAGE = 'SET_LANGUAGE';

export interface LanguageActionSet extends Action<'SET_LANGUAGE'> {
  payload: string;
}

export const setLanguage: ActionCreator<LanguageActionSet> = (payload: string) => {
  return {
    type: SET_LANGUAGE,
    payload
  };
};

export type LanguageAction = LanguageActionSet;
