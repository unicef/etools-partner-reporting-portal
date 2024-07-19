import Constants from '../../etools-prp-common/constants';

export class ActiveLanguageState {
  activeLanguage: string = '';
}

const INITIAL_STATE = new ActiveLanguageState();

export const activeLanguage = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case Constants.SET_LANGUAGE:
      return {...state, activeLanguage: action.payload};
    default:
      return state;
  }
};
