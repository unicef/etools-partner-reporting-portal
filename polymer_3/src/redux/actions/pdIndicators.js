import Constants from '../../etools-prp-common/constants';
export const pdIndicatorsLoading = function (pdId, loading) {
    return {
        type: Constants.SET_PD_INDICATORS_LOADING,
        pdId: pdId,
        loading: loading
    };
};
export const pdIndicatorsLoadingStart = function (pdId) {
    return pdIndicatorsLoading(pdId, true);
};
export const pdIndicatorsSet = function (pdId, indicatorData) {
    return {
        type: Constants.SET_PD_INDICATORS,
        pdId: pdId,
        indicatorData: indicatorData
    };
};
export const pdIndicatorsLoadingStop = function (pdId) {
    return pdIndicatorsLoading(pdId, false);
};
// use instead of     App.Actions.PDIndicators.
export const pdIndicatorsFetch = function (indicatorsThunk, pdId) {
    return function (dispatch) {
        dispatch(pdIndicatorsLoadingStart(pdId));
        return indicatorsThunk()
            .then(function (res) {
            dispatch(pdIndicatorsSet(pdId, res.data));
            dispatch(pdIndicatorsLoadingStop(pdId));
        })
            .catch(function (err) {
            dispatch(pdIndicatorsLoadingStop(pdId));
            return Promise.reject(err);
        });
    };
};
export const pdIndicatorsUpdate = function (updateThunk, pdId) {
    return function (dispatch) {
        dispatch(pdIndicatorsLoadingStart(pdId));
        return updateThunk()
            .then(function (res) {
            dispatch(pdIndicatorsSet(pdId, res.data));
            dispatch(pdIndicatorsLoadingStop(pdId));
        })
            .catch(function (err) {
            dispatch(pdIndicatorsLoadingStop(pdId));
            return Promise.reject(err);
        });
    };
};
