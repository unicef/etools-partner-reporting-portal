import Constants from '../../constants';

export const partnerActivitiesLoadingStart = function () {
  return {
    type: Constants.PARTNER_ACTIVITIES_LOADING_START
  };
};

export const partnerActivitiesLoadingStop = function () {
  return {
    type: Constants.PARTNER_ACTIVITIES_LOADING_STOP
  };
};

export const setPartnerActivitiesList = function (data: any) {
  return {
    type: Constants.SET_PARTNER_ACTIVITIES_LIST,
    data: data
  };
};

export const setPartnerActivitiesCount = function (data: any) {
  return {
    type: Constants.SET_PARTNER_ACTIVITIES_COUNT,
    count: data.count
  };
};

export const fetchPartnerActivitiesList = function (thunk: any) {
  return function (dispatch: any) {
    dispatch(partnerActivitiesLoadingStart());
    return thunk()
      .catch(function () {
        dispatch(partnerActivitiesLoadingStop());
      })
      .then(function (res: any) {
        dispatch(setPartnerActivitiesList(res.data));
        dispatch(setPartnerActivitiesCount(res.data));
        dispatch(partnerActivitiesLoadingStop());
      });
  };
};

// App.Actions.PartnerProjects.activities = {
//   fetch = function (thunk, partnerProjectId) {
//     return function (dispatch) {
//       dispatch(App.Actions.PartnerProjects.activities.setLoadingStart());
//       return thunk()
//         .then(function (res) {
//           dispatch(App.Actions.PartnerProjects.activities.set(
//             partnerProjectId, res.data.results
//           ));
//           dispatch(App.Actions.PartnerProjects.activities.setCount(
//             partnerProjectId, res.data.count
//           ));
//           dispatch(App.Actions.PartnerProjects.activities.setLoadingStop());
//         });
//     };
//   }

//   set = function (partnerProjectId, data) {
//     return {
//       type: Constants.SET_ACTIVITIES_BY_PARTNER_PROJECT_ID,
//       partnerProjectId: partnerProjectId,
//       data: data,
//     };
//   }

//   setCount = function (partnerProjectId, count) {
//     return {
//       type: Constants.SET_ACTIVITIES_BY_PARTNER_PROJECT_ID_COUNT,
//       partnerProjectId: partnerProjectId,
//       count: count,
//     };
//   }

//   setLoadingStop = function () {
//     return {
//       type: Constants.ACTIVITIES_BY_PARTNER_PROJECT_ID_LOADING_STOP,
//     };
//   }

//   setLoadingStart = function () {
//     return {
//       type: Constants.ACTIVITIES_BY_PARTNER_PROJECT_ID_LOADING_START,
//     };
//   }
// };

const partnerActivitiesIndicatorsSetLoadingStart = function () {
  return {
    type: Constants.INDICATORS_BY_PARTNER_ACTIVITY_ID_LOADING_START
  };
};

export const partnerActivitiesIndicatorsSetIndicators = function (partnerActivityId: string, data: any) {
  return {
    type: Constants.SET_INDICATORS_BY_PARTNER_ACTIVITY_ID,
    partnerActivityId: partnerActivityId,
    data: data
  };
};

export const partnerActivitiesIndicatorsSetCount = function (partnerActivityId: string, count: number) {
  return {
    type: Constants.SET_INDICATORS_BY_PARTNER_ACTIVITY_ID_COUNT,
    partnerActivityId: partnerActivityId,
    count: count
  };
};

const partnerActivitiesIndicatorsSetLoadingStop = function () {
  return {
    type: Constants.INDICATORS_BY_PARTNER_ACTIVITY_ID_LOADING_STOP
  };
};

// App.Actions.PartnerActivities.indicators
export const partnerActivitiesIndicatorsFetch = function (thunk: any, partnerActivityId: string) {
  return function (dispatch: any) {
    dispatch(partnerActivitiesIndicatorsSetLoadingStart());
    return thunk().then(function (res: any) {
      dispatch(partnerActivitiesIndicatorsSetIndicators(partnerActivityId, res.data.results));
      dispatch(partnerActivitiesIndicatorsSetCount(partnerActivityId, res.data.count));
      dispatch(partnerActivitiesIndicatorsSetLoadingStop());
    });
  };
};
