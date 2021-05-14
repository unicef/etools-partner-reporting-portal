import Constants from '../constants';
import {GenericObject} from '../typings/globals.types';

// L11N
export const setL11NResources = function (resources: GenericObject) {
  return {
    type: Constants.SET_L11N_RESOURCES,
    resources: resources
  };
};

// Localization
export const setLanguage = function (language: string) {
  return {
    type: Constants.SET_LANGUAGE,
    language: language
  };
};

// Auth
export const setToken = function (token: string) {
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

export const userLogout = function (logoutThunk: any) {
  return function (dispatch: any) {
    return logoutThunk().then(function () {
      dispatch(resetToken());
    });
  };
};

export const setUserProfile = function (data: any) {
  return {
    type: Constants.SET_USER_PROFILE,
    data: data
  };
};

export const setAccountType = function (data: GenericObject) {
  return {
    type: Constants.SET_ACCOUNT_TYPE,
    data: data
  };
};

// Partner data
export const setPartner = function (partnerData: any) {
  return {
    type: Constants.SET_PARTNER,
    partnerData: partnerData
  };
};

export const fetchUserProfile = function (profileThunk: any) {
  return function (dispatch: any) {
    return profileThunk().then(function (res: any) {
      dispatch(setUserProfile(res.data));
      dispatch(setAccountType(res.data));
      dispatch(setPartner(res.data.partner));
    });
  };
};

export const setWorkspaces = function (workspaces: any) {
  return {
    type: Constants.SET_WORKSPACES,
    workspaces: workspaces
  };
};

// Workspaces
export const fetchWorkspaces = function (interventionsThunk: any) {
  return function (dispatch: any) {
    return interventionsThunk().then((res: any) => {
      const workspaces = (res.data || []).map((workspace: any) => {
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

export const setWorkspace = function (newWorkspace: any) {
  return {
    type: Constants.SET_WORKSPACE,
    workspace: newWorkspace
  };
};

export const setResponsePlans = function (plans: any) {
  return {
    type: Constants.SET_RESPONSE_PLANS,
    plans: plans
  };
};

// Gets a list of all response plans for the currently selected location ID.
export const fetchResponsePlans = function (responsePlansThunk: any) {
  return function (dispatch: any) {
    return responsePlansThunk().then(function (res: any) {
      dispatch(setResponsePlans(res.data));
    });
  };
};

export const setCurrentResponsePlanID = function (newPlanID: any) {
  return {
    type: Constants.SET_CURRENT_RESPONSE_PLAN_ID,
    planID: newPlanID
  };
};

export const setCurrentResponsePlan = function (newPlan: any) {
  return {
    type: Constants.SET_CURRENT_RESPONSE_PLAN,
    plan: newPlan
  };
};

export const addResponsePlan = function (newPlan: any) {
  return {
    type: Constants.ADD_RESPONSE_PLAN,
    plan: newPlan
  };
};

export const setApp = function (app: any) {
  return {
    type: Constants.SET_APP,
    app: app
  };
};

export const setProgrammeDocuments = function (data: any) {
  return {
    type: Constants.SET_PROGRAMME_DOCUMENTS,
    data: data
  };
};

// Programme documents
export const fetchProgrammeDocuments = function (pdThunk: any) {
  return function (dispatch: any) {
    return pdThunk().then((res: any) => {
      const pdData = res.data;

      dispatch(setProgrammeDocuments(pdData));
    });
  };
};

export const setProgrammeDocumentDetails = function (pdDetailsData: GenericObject) {
  return {
    type: Constants.SET_PROGRAMME_DOCUMENT_DETAILS,
    pdDetailsData: pdDetailsData
  };
};

export const fetchProgrammeDocumentDetails = function (pdDetailsThunk: any) {
  return function (dispatch: any) {
    return pdDetailsThunk().then((res: any) => {
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
