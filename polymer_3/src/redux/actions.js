import Constants from '../etools-prp-common/constants';
// L11N
export const setL11NResources = function (resources) {
    return {
        type: Constants.SET_L11N_RESOURCES,
        resources: resources
    };
};
// Localization
export const setLanguage = function (language) {
    return {
        type: Constants.SET_LANGUAGE,
        language: language
    };
};
// Auth
export const setToken = function (token) {
    return {
        type: Constants.SET_TOKEN,
        token: token
    };
};
export const resetToken = function () {
    return {
        type: Constants.RESET_TOKEN
    };
};
export const userLogin = function () {
    return {
        type: Constants.USER_LOGIN
    };
};
export const userLogout = function (logoutThunk) {
    return function (dispatch) {
        return logoutThunk().then(function () {
            dispatch(resetToken());
        });
    };
};
export const setUserProfile = function (data) {
    return {
        type: Constants.SET_USER_PROFILE,
        data: data
    };
};
export const setAccountType = function (data) {
    return {
        type: Constants.SET_ACCOUNT_TYPE,
        data: data
    };
};
// Partner data
export const setPartner = function (partnerData) {
    return {
        type: Constants.SET_PARTNER,
        partnerData: partnerData
    };
};
export const fetchUserProfile = function (profileThunk) {
    return function (dispatch) {
        return profileThunk().then(function (res) {
            dispatch(setUserProfile(res.data));
            dispatch(setAccountType(res.data));
            dispatch(setPartner(res.data.partner));
        });
    };
};
export const setWorkspaces = function (workspaces) {
    return {
        type: Constants.SET_WORKSPACES,
        workspaces: workspaces
    };
};
// Workspaces
export const fetchWorkspaces = function (interventionsThunk) {
    return function (dispatch) {
        return interventionsThunk().then((res) => {
            const workspaces = (res.data || []).map((workspace) => {
                return {
                    id: workspace.id,
                    code: workspace.workspace_code,
                    name: workspace.title,
                    latitude: workspace.latitude,
                    longitude: workspace.longitude
                };
            });
            dispatch(setWorkspaces(workspaces));
        });
    };
};
export const setWorkspace = function (newWorkspace) {
    return {
        type: Constants.SET_WORKSPACE,
        workspace: newWorkspace
    };
};
export const setResponsePlans = function (plans) {
    return {
        type: Constants.SET_RESPONSE_PLANS,
        plans: plans
    };
};
// Gets a list of all response plans for the currently selected location ID.
export const fetchResponsePlans = function (responsePlansThunk) {
    return function (dispatch) {
        return responsePlansThunk().then(function (res) {
            dispatch(setResponsePlans(res.data));
        });
    };
};
export const setCurrentResponsePlanID = function (newPlanID) {
    return {
        type: Constants.SET_CURRENT_RESPONSE_PLAN_ID,
        planID: newPlanID
    };
};
export const setCurrentResponsePlan = function (newPlan) {
    return {
        type: Constants.SET_CURRENT_RESPONSE_PLAN,
        plan: newPlan
    };
};
export const addResponsePlan = function (newPlan) {
    return {
        type: Constants.ADD_RESPONSE_PLAN,
        plan: newPlan
    };
};
export const setApp = function (app) {
    return {
        type: Constants.SET_APP,
        app: app
    };
};
export const setProgrammeDocuments = function (data) {
    return {
        type: Constants.SET_PROGRAMME_DOCUMENTS,
        data: data
    };
};
// Programme documents
export const fetchProgrammeDocuments = function (pdThunk) {
    return function (dispatch) {
        return pdThunk().then((res) => {
            const pdData = res.data;
            dispatch(setProgrammeDocuments(pdData));
        });
    };
};
export const setProgrammeDocumentDetails = function (pdDetailsData) {
    return {
        type: Constants.SET_PROGRAMME_DOCUMENT_DETAILS,
        pdDetailsData: pdDetailsData
    };
};
export const fetchProgrammeDocumentDetails = function (pdDetailsThunk) {
    return function (dispatch) {
        return pdDetailsThunk().then((res) => {
            const pdDetailsData = res.data;
            dispatch(setProgrammeDocumentDetails(pdDetailsData));
        });
    };
};
// Master reset
export const reset = function () {
    return {
        type: Constants.RESET
    };
};
