import Constants from '../../constants';
import {ReduxDispatch} from '../store';

const analysis_operationalPresence_dataLoadingStart = function () {
  return {
    type: Constants.OPERATIONAL_PRESENCE_DATA_LOADING_START
  };
};

const analysis_operationalPresence_dataLoadingStop = function () {
  return {
    type: Constants.OPERATIONAL_PRESENCE_DATA_LOADING_STOP
  };
};

export const analysis_operationalPresence_setData = function (data: any) {
  return {
    type: Constants.SET_OPERATIONAL_PRESENCE_DATA,
    data: data
  };
};

export const analysis_operationalPresence_fetchData = (dataThunk: any) => {
  return function (dispatch: ReduxDispatch) {
    dispatch(analysis_operationalPresence_dataLoadingStart());

    return dataThunk()
      .then(function (res: any) {
        dispatch(analysis_operationalPresence_dataLoadingStop());
        dispatch(analysis_operationalPresence_setData(res.data));
      })
      .catch(function (err: any) {
        dispatch(analysis_operationalPresence_dataLoadingStop());

        return Promise.reject(err);
      });
  };
};

const analysis_operationalPresence_mapLoadingStart = function () {
  return {
    type: Constants.OPERATIONAL_PRESENCE_MAP_LOADING_START
  };
};

const analysis_operationalPresence_mapLoadingStop = function () {
  return {
    type: Constants.OPERATIONAL_PRESENCE_MAP_LOADING_STOP
  };
};

export const analysis_operationalPresence_setMap = function (map: any) {
  return {
    type: Constants.SET_OPERATIONAL_PRESENCE_MAP,
    map: map
  };
};

export const analysis_operationalPresence_fetchMap = function (mapThunk: any) {
  return function (dispatch: ReduxDispatch) {
    dispatch(analysis_operationalPresence_mapLoadingStart());

    return mapThunk()
      .then(function (res: any) {
        dispatch(analysis_operationalPresence_mapLoadingStop());
        dispatch(analysis_operationalPresence_setMap(res.data));
      })
      .catch(function (err: any) {
        dispatch(analysis_operationalPresence_mapLoadingStop());

        return Promise.reject(err);
      });
  };
};

const analysis_indicators_dataLoadingStart = function () {
  return {
    type: Constants.ANALYSIS_INDICATORS_DATA_LOADING_START
  };
};

const analysis_indicators_dataLoadingStop = function () {
  return {
    type: Constants.ANALYSIS_INDICATORS_DATA_LOADING_STOP
  };
};

const analysis_indicators_setData = function (data: any) {
  return {
    type: Constants.SET_ANALYSIS_INDICATORS_DATA,
    data: data
  };
};

export const analysis_indicators_fetchData = function (dataThunk: any) {
  return function (dispatch: ReduxDispatch) {
    dispatch(analysis_indicators_dataLoadingStart());

    return dataThunk()
      .then(function (res: any) {
        dispatch(analysis_indicators_dataLoadingStop());
        dispatch(analysis_indicators_setData(res.data));
      })
      .catch(function (err: any) {
        dispatch(analysis_indicators_dataLoadingStop());

        return Promise.reject(err);
      });
  };
};

const analysis_indicators_singleLoadingStart = function (indicatorId: string) {
  return {
    type: Constants.ANALYSIS_INDICATOR_DATA_LOADING_START,
    indicatorId: indicatorId
  };
};

const analysis_indicators_singleLoadingStop = function (indicatorId: string) {
  return {
    type: Constants.ANALYSIS_INDICATOR_DATA_LOADING_STOP,
    indicatorId: indicatorId
  };
};

const analysis_indicators_setSingle = function (indicatorId: string, data: any) {
  return {
    type: Constants.SET_ANALYSIS_INDICATOR_DATA,
    indicatorId: indicatorId,
    data: data
  };
};

export const analysis_indicators_fetchSingle = function (indicatorThunk: any, indicatorId: string) {
  return function (dispatch: ReduxDispatch) {
    dispatch(analysis_indicators_singleLoadingStart(indicatorId));

    return indicatorThunk()
      .then(function (res: any) {
        dispatch(analysis_indicators_singleLoadingStop(indicatorId));
        dispatch(analysis_indicators_setSingle(indicatorId, res.data));
      })
      .catch(function (err: any) {
        dispatch(analysis_indicators_singleLoadingStop(indicatorId));

        return Promise.reject(err);
      });
  };
};
