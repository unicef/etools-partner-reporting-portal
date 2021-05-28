import Constants from '../../etools-prp-common/constants';

// use instead of App.Actions.Localize.set
export const localizeSet = (language: string) => {
  return {
    type: Constants.SET_LANGUAGE,
    language: language
  };
};
