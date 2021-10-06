import Constants from '../../constants';
export const configLoadingStart = function () {
    return {
        type: Constants.CONFIG_LOADING_START
    };
};
export const setConfig = function (config) {
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
export const fetchConfig = function (thunk, selector) {
    return function (dispatch, getState) {
        // don't fetch config if we already have wanted value
        // TODO: this should work with array of selectors
        if (typeof selector === 'function' && selector(getState())) {
            return Promise.resolve();
        }
        dispatch(configLoadingStart());
        return thunk()
            .then(function (res) {
            const data = res.data;
            dispatch(setConfig(data));
            dispatch(configLoadingStop());
        })
            .catch(function () {
            dispatch(configLoadingStop());
        });
    };
};
