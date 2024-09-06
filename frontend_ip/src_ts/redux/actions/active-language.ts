import Constants from '../../etools-prp-common/constants';

export const setActiveLanguage = (payload: string) => {
  return {
    type: Constants.SET_LANGUAGE,
    payload
  };
};
