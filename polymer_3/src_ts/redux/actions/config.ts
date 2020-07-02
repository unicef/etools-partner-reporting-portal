import Constants from '../../constants';

export const configLoadingStart = function () {
  return {
    type: Constants.CONFIG_LOADING_START
  };
};

export const setConfig = function (config: any) {
  return {
    type: Constants.SET_CONFIG,
    config: config
  };
};

export const configLoadingStop = function () {
  return {
    type: Constants.CONFIG_LOADING_END
  };
};

export const fetchConfig = function (thunk: any, selector: any) {
  return function (dispatch: any, getState: any) {
    // don't fetch config if we already have wanted value
    // TODO: this should work with array of selectors
    if (typeof selector === 'function' && selector(getState())) {
      return Promise.resolve();
    }

    dispatch(configLoadingStart());

    return thunk()
      .then(function (res: any) {
        const data = res.data;

        dispatch(setConfig(data));
        dispatch(configLoadingStop());
      })
      .catch(function () {
        dispatch(configLoadingStop());
      });
  };
};
