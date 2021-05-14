import Constants from '../../constants';

export const pdReportsSet = function (pdId: string, data: any) {
  return {
    type: Constants.SET_PD_REPORTS,
    pdId: pdId,
    data: data
  };
};

export const pdReportsSetCount = function (pdId: string, count: number) {
  return {
    type: Constants.SET_PD_REPORTS_COUNT,
    pdId: pdId,
    count: count
  };
};

// use instead of App.Actions.PDReports
export const pdReportsFetch = function (pdReportsThunk: any, pdId: any) {
  return function (dispatch: any) {
    return pdReportsThunk().then(function (res: any) {
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

export const pdReportsSetSingle = function (pdId: string, data: any) {
  return {
    type: Constants.SET_PD_REPORT,
    pdId: pdId,
    data: data
  };
};

export const pdReportsFetchSingle = function (reportThunk: any, pdId: any) {
  return function (dispatch: any) {
    dispatch(pdReportsLoadingStart());

    return reportThunk()
      .then(function (res: any) {
        dispatch(pdReportsLoadingStop());
        dispatch(pdReportsSetSingle(pdId, res.data));
      })
      .catch(function (err: any) {
        dispatch(pdReportsLoadingStop());

        return Promise.reject(err);
      });
  };
};

export const pdReportsUpdateSingle = function (pdId: string, reportId: string, data: any) {
  return {
    type: Constants.UPDATE_PD_REPORT,
    pdId: pdId,
    reportId: reportId,
    data: data
  };
};

export const pdReportsUpdate = function (updateThunk: any, pdId: string, reportId: string) {
  return function (dispatch: any) {
    return updateThunk().then(function (res: any) {
      dispatch(pdReportsUpdateSingle(pdId, reportId, res.data));
    });
  };
};

export const pdReportsSetCurrent = function (reportId: string, mode: any) {
  return {
    type: Constants.SET_CURRENT_PD_REPORT,
    reportId: reportId,
    mode: mode
  };
};

export const pdReportsAmendReportable = function (pdId: string, reportId: string, reportableId: string, data: any) {
  return {
    type: Constants.AMEND_REPORTABLE,
    pdId: pdId,
    reportId: reportId,
    reportableId: reportableId,
    data: data
  };
};

export const pdReportsUpdateReportable = function (
  updateThunk: any,
  pdId: string,
  reportId: string,
  reportableId: string
) {
  return function (dispatch: any) {
    return updateThunk().then(function (res: any) {
      dispatch(pdReportsAmendReportable(pdId, reportId, reportableId, res.data));
    });
  };
};
