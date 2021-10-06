import Constants from '../../constants';
const clusterObjectivesLoadingStart = function () {
    return {
        type: Constants.CLUSTER_OBJECTIVES_LOADING_START
    };
};
const setClusterObjectivesList = function (data) {
    return {
        type: Constants.SET_CLUSTER_OBJECTIVES_LIST,
        data: data
    };
};
const setClusterObjectivesCount = function (data) {
    return {
        type: Constants.SET_CLUSTER_OBJECTIVES_COUNT,
        count: data.count
    };
};
const clusterObjectivesLoadingStop = function () {
    return {
        type: Constants.CLUSTER_OBJECTIVES_LOADING_STOP
    };
};
// App.Actions.ClusterObjectives
export const fetchClusterObjectivesList = function (thunk) {
    return function (dispatch) {
        dispatch(clusterObjectivesLoadingStart());
        return thunk()
            .catch(function () {
            dispatch(clusterObjectivesLoadingStart());
        })
            .then(function (res) {
            dispatch(setClusterObjectivesList(res.data));
            dispatch(setClusterObjectivesCount(res.data));
            dispatch(clusterObjectivesLoadingStop());
        });
    };
};
const setLoadingStart = function () {
    return {
        type: Constants.INDICATORS_BY_CLUSTER_OBJECTIVE_ID_LOADING_START
    };
};
const setIndicators = function (clusterObjectiveId, data) {
    return {
        type: Constants.SET_INDICATORS_BY_CLUSTER_OBJECTIVE_ID,
        clusterObjectiveId: clusterObjectiveId,
        data: data
    };
};
const setCount = function (clusterObjectiveId, count) {
    return {
        type: Constants.SET_INDICATORS_BY_CLUSTER_OBJECTIVE_ID_COUNT,
        clusterObjectiveId: clusterObjectiveId,
        count: count
    };
};
const setLoadingStop = function () {
    return {
        type: Constants.INDICATORS_BY_CLUSTER_OBJECTIVE_ID_LOADING_STOP
    };
};
// App.Actions.ClusterObjectives.indicators
export const clusterObjectivesIndicatorsFetch = function (thunk, clusterObjectiveId) {
    return function (dispatch) {
        dispatch(setLoadingStart());
        return thunk()
            .then(function (res) {
            dispatch(setIndicators(clusterObjectiveId, res.data.results));
            dispatch(setCount(clusterObjectiveId, res.data.count));
            dispatch(setLoadingStop());
        });
    };
};
