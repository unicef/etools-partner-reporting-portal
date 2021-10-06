import Constants from '../../etools-prp-common/constants';
export const pdReportsSet = function (pdId, data) {
    return {
        type: Constants.SET_PD_REPORTS,
        pdId: pdId,
        data: data
    };
};
export const pdReportsSetCount = function (pdId, count) {
    return {
        type: Constants.SET_PD_REPORTS_COUNT,
        pdId: pdId,
        count: count
    };
};
// use instead of App.Actions.PDReports
export const pdReportsFetch = function (pdReportsThunk, pdId) {
    return function (dispatch) {
        return pdReportsThunk().then(function (res) {
            dispatch(pdReportsSet(pdId, res.data.results));
            dispatch(pdReportsSetCount(pdId, res.data.count));
        });
    };
};
export const pdReportsLoadingStart = function () {
    return {
        type: Constants.PD_REPORT_LOADING_START
    };
};
export const pdReportsLoadingStop = function () {
    return {
        type: Constants.PD_REPORT_LOADING_STOP
    };
};
export const pdReportsSetSingle = function (pdId, data) {
    return {
        type: Constants.SET_PD_REPORT,
        pdId: pdId,
        data: data
    };
};
export const pdReportsFetchSingle = function (reportThunk, pdId) {
    return function (dispatch) {
        dispatch(pdReportsLoadingStart());
        return reportThunk()
            .then(function (res) {
            dispatch(pdReportsLoadingStop());
            dispatch(pdReportsSetSingle(pdId, res.data));
        })
            .catch(function (err) {
            dispatch(pdReportsLoadingStop());
            return Promise.reject(err);
        });
    };
};
export const pdReportsUpdateSingle = function (pdId, reportId, data) {
    return {
        type: Constants.UPDATE_PD_REPORT,
        pdId: pdId,
        reportId: reportId,
        data: data
    };
};
export const pdReportsUpdate = function (updateThunk, pdId, reportId) {
    return function (dispatch) {
        return updateThunk().then(function (res) {
            dispatch(pdReportsUpdateSingle(pdId, reportId, res.data));
        });
    };
};
export const pdReportsSetCurrent = function (reportId, mode) {
    return {
        type: Constants.SET_CURRENT_PD_REPORT,
        reportId: reportId,
        mode: mode
    };
};
export const pdReportsAmendReportable = function (pdId, reportId, reportableId, data) {
    return {
        type: Constants.AMEND_REPORTABLE,
        pdId: pdId,
        reportId: reportId,
        reportableId: reportableId,
        data: data
    };
};
export const pdReportsUpdateReportable = function (updateThunk, pdId, reportId, reportableId) {
    return function (dispatch) {
        return updateThunk().then(function (res) {
            dispatch(pdReportsAmendReportable(pdId, reportId, reportableId, res.data));
        });
    };
};
