import Constants from '../../constants';

// use instead of App.Actions.Localize.set
export const localizeSet = (language: string) => {
  return {
    type: Constants.SET_LANGUAGE,
    language: language
  };
};
