import Constants from '../../constants';
const partnerProjectsLoadingStart = function () {
    return {
        type: Constants.PARTNER_PROJECTS_LOADING_START
    };
};
const partnerProjectsLoadingStop = function () {
    return {
        type: Constants.PARTNER_PROJECTS_LOADING_STOP
    };
};
export const setPartnerProjectsList = function (data) {
    return {
        type: Constants.SET_PARTNER_PROJECTS_LIST,
        data: data
    };
};
export const setPartnerProjectsCount = function (data) {
    return {
        type: Constants.SET_PARTNER_PROJECTS_COUNT,
        count: data.count
    };
};
// App.Actions.PartnerProjects
export const fetchPartnerProjectsList = function (thunk) {
    return function (dispatch) {
        dispatch(partnerProjectsLoadingStart());
        return thunk()
            .catch(function () {
            dispatch(partnerProjectsLoadingStop());
        })
            .then(function (res) {
            dispatch(setPartnerProjectsList(res.data));
            dispatch(setPartnerProjectsCount(res.data));
            dispatch(partnerProjectsLoadingStop());
        });
    };
};
const partnerProjActivitiesSetLoadingStart = function () {
    return {
        type: Constants.ACTIVITIES_BY_PARTNER_PROJECT_ID_LOADING_START
    };
};
export const partnerProjActivitiesSet = function (partnerProjectId, data) {
    return {
        type: Constants.SET_ACTIVITIES_BY_PARTNER_PROJECT_ID,
        partnerProjectId: partnerProjectId,
        data: data
    };
};
export const partnerProjActivitiesSetCount = function (partnerProjectId, count) {
    return {
        type: Constants.SET_ACTIVITIES_BY_PARTNER_PROJECT_ID_COUNT,
        partnerProjectId: partnerProjectId,
        count: count
    };
};
const partnerProjActivitiesSetLoadingStop = function () {
    return {
        type: Constants.ACTIVITIES_BY_PARTNER_PROJECT_ID_LOADING_STOP
    };
};
// App.Actions.PartnerProjects.activities =
export const partnerProjActivitiesFetch = function (thunk, partnerProjectId) {
    return function (dispatch) {
        dispatch(partnerProjActivitiesSetLoadingStart());
        return thunk()
            .then(function (res) {
            dispatch(partnerProjActivitiesSet(partnerProjectId, res.data.results));
            dispatch(partnerProjActivitiesSetCount(partnerProjectId, res.data.count));
            dispatch(partnerProjActivitiesSetLoadingStop());
        });
    };
};
const partnerProjIndicatorsSetLoadingStart = function () {
    return {
        type: Constants.INDICATORS_BY_PARTNER_PROJECT_ID_LOADING_START
    };
};
export const partnerProjIndicatorsSetIndicators = function (partnerProjectId, data) {
    return {
        type: Constants.SET_INDICATORS_BY_PARTNER_PROJECT_ID,
        partnerProjectId: partnerProjectId,
        data: data
    };
};
export const partnerProjIndicatorsSetCount = function (partnerProjectId, count) {
    return {
        type: Constants.SET_INDICATORS_BY_PARTNER_PROJECT_ID_COUNT,
        partnerProjectId: partnerProjectId,
        count: count
    };
};
const partnerProjIndicatorsSetLoadingStop = function () {
    return {
        type: Constants.INDICATORS_BY_PARTNER_PROJECT_ID_LOADING_STOP
    };
};
// App.Actions.PartnerProjects.indicators =
export const partnerProjIndicatorsFetch = function (thunk, partnerProjectId) {
    return function (dispatch) {
        dispatch(partnerProjIndicatorsSetLoadingStart());
        return thunk()
            .then(function (res) {
            dispatch(partnerProjIndicatorsSetIndicators(partnerProjectId, res.data.results));
            dispatch(partnerProjIndicatorsSetCount(partnerProjectId, res.data.count));
            dispatch(partnerProjIndicatorsSetLoadingStop());
        });
    };
};
