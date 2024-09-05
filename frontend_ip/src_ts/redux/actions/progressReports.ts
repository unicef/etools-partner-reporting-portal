import Constants from '../../etools-prp-common/constants';

export const progressReportsLoadingStart = function () {
  return {
    type: Constants.PROGRESS_REPORTS_LOADING_START
  };
};

export const progressReportsSet = function (data: any) {
  return {
    type: Constants.SET_PROGRESS_REPORTS,
    data: data
  };
};

export const progressReportsSetCount = function (count: number) {
  return {
    type: Constants.SET_PROGRESS_REPORTS_COUNT,
    count: count
  };
};

export const progressReportsLoadingStop = function () {
  return {
    type: Constants.PROGRESS_REPORTS_LOADING_STOP
  };
};

// use instead of App.Actions.ProgressReports
export const progressReportsFetch = function (progressReportsThunk: any) {
  return function (dispatch: any) {
    dispatch(progressReportsLoadingStart());

    return progressReportsThunk
      .then(function (res: any) {
        dispatch(progressReportsSet(res?.results || []));
        dispatch(progressReportsSetCount(res?.count || 0));
        dispatch(progressReportsLoadingStop());
      })
      .catch(function (err: any) {
        dispatch(progressReportsLoadingStop());

        return Promise.reject(err);
      });
  };
};
