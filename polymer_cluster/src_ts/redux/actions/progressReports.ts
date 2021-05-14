import Constants from '../../constants';

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

    return progressReportsThunk()
      .then(function (res: any) {
        const progressReportsData = res.data;

        dispatch(progressReportsSet(progressReportsData.results));
        dispatch(progressReportsSetCount(progressReportsData.count));
        dispatch(progressReportsLoadingStop());
      })
      .catch(function (err: any) {
        dispatch(progressReportsLoadingStop());

        return Promise.reject(err);
      });
  };
};
