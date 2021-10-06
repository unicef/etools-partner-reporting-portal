import Constants from '../../constants';
const set = function (data) {
    return {
        type: Constants.SET_CLUSTER_INDICATOR_REPORTS,
        data: data
    };
};
const loadingStart = function () {
    return {
        type: Constants.CLUSTER_INDICATOR_REPORTS_LOADING_START
    };
};
const setCount = function (count) {
    return {
        type: Constants.SET_CLUSTER_INDICATOR_REPORTS_COUNT,
        count: count
    };
};
const loadingStop = function () {
    return {
        type: Constants.CLUSTER_INDICATOR_REPORTS_LOADING_STOP
    };
};
// Actions.ClusterIndicatorReports
export const clusterIndicatorReportsFetch = function (reportsThunk, reset) {
    return function (dispatch) {
        if (reset) {
            dispatch(set([]));
        }
        dispatch(loadingStart());
        return reportsThunk()
            .then(function (res) {
            dispatch(set(res.data.results));
            dispatch(setCount(res.data.count));
            dispatch(loadingStop());
        })
            .catch(function (err) {
            dispatch(loadingStop());
            return Promise.reject(err);
        });
    };
};
export const clusterIndicatorReportsUpdateSingle = function (reportId, data) {
    return {
        type: Constants.UPDATE_CLUSTER_INDICATOR_REPORT,
        reportId: reportId,
        data: data
    };
};
export const clusterIndicatorReportsFetchSingle = function (reportThunk, reportId) {
    return function (dispatch) {
        return reportThunk()
            .then(function (res) {
            dispatch(clusterIndicatorReportsUpdateSingle(reportId, res.data));
        });
    };
};
export const clusterIndicatorReportsSubmit = function (submitThunk) {
    return function (dispatch) {
        return submitThunk();
    };
};
export const ClusterIndicatorReportsUpdate = function (updateThunk, reportId) {
    return function (dispatch) {
        return updateThunk()
            .then(function (res) {
            dispatch(clusterIndicatorReportsUpdateSingle(reportId, res.data));
        });
    };
};
