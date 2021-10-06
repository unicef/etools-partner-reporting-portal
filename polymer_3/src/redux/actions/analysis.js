import Constants from '../../constants';
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
export const analysis_operationalPresence_setData = function (data) {
    return {
        type: Constants.SET_OPERATIONAL_PRESENCE_DATA,
        data: data
    };
};
export const analysis_operationalPresence_fetchData = (dataThunk) => {
    return function (dispatch) {
        dispatch(analysis_operationalPresence_dataLoadingStart());
        return dataThunk()
            .then(function (res) {
            dispatch(analysis_operationalPresence_dataLoadingStop());
            dispatch(analysis_operationalPresence_setData(res.data));
        })
            .catch(function (err) {
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
export const analysis_operationalPresence_setMap = function (map) {
    return {
        type: Constants.SET_OPERATIONAL_PRESENCE_MAP,
        map: map
    };
};
export const analysis_operationalPresence_fetchMap = function (mapThunk) {
    return function (dispatch) {
        dispatch(analysis_operationalPresence_mapLoadingStart());
        return mapThunk()
            .then(function (res) {
            dispatch(analysis_operationalPresence_mapLoadingStop());
            dispatch(analysis_operationalPresence_setMap(res.data));
        })
            .catch(function (err) {
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
const analysis_indicators_setData = function (data) {
    return {
        type: Constants.SET_ANALYSIS_INDICATORS_DATA,
        data: data
    };
};
export const analysis_indicators_fetchData = function (dataThunk) {
    return function (dispatch) {
        dispatch(analysis_indicators_dataLoadingStart());
        return dataThunk()
            .then(function (res) {
            dispatch(analysis_indicators_dataLoadingStop());
            dispatch(analysis_indicators_setData(res.data));
        })
            .catch(function (err) {
            dispatch(analysis_indicators_dataLoadingStop());
            return Promise.reject(err);
        });
    };
};
const analysis_indicators_singleLoadingStart = function (indicatorId) {
    return {
        type: Constants.ANALYSIS_INDICATOR_DATA_LOADING_START,
        indicatorId: indicatorId
    };
};
const analysis_indicators_singleLoadingStop = function (indicatorId) {
    return {
        type: Constants.ANALYSIS_INDICATOR_DATA_LOADING_STOP,
        indicatorId: indicatorId
    };
};
const analysis_indicators_setSingle = function (indicatorId, data) {
    return {
        type: Constants.SET_ANALYSIS_INDICATOR_DATA,
        indicatorId: indicatorId,
        data: data
    };
};
export const analysis_indicators_fetchSingle = function (indicatorThunk, indicatorId) {
    return function (dispatch) {
        dispatch(analysis_indicators_singleLoadingStart(indicatorId));
        return indicatorThunk()
            .then(function (res) {
            dispatch(analysis_indicators_singleLoadingStop(indicatorId));
            dispatch(analysis_indicators_setSingle(indicatorId, res.data));
        })
            .catch(function (err) {
            dispatch(analysis_indicators_singleLoadingStop(indicatorId));
            return Promise.reject(err);
        });
    };
};
