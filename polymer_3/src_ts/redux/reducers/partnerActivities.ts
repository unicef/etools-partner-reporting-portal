import Constants from '../../constants';
import {combineReducers} from 'redux';
import {GenericObject} from '../../typings/globals.types';

export class PartnerActivitiesState {
  all = [];
  count = 0;
  loading = false;
  // activities: ,
  // activitiesCount: ,
  // activitiesLoading: ,
  indicators: GenericObject = {};
  indicatorsCount = 0;
  indicatorsLoading = false;
}

export const PartnerActivities = combineReducers({
  all: partnerActivitiesListReducer,
  count: partnerActivitiesCountReducer,
  loading: loadingPartnerActivitiesReducer,
  // activities: activitiesByPartnerProjectIdReducer,
  // activitiesCount: activitiesByPartnerProjectIdCountReducer,
  // activitiesLoading: activitiesByPartnerProjectIdLoadingReducer,
  indicators: indicatorsReducer,
  indicatorsCount: indicatorsCountReducer,
  indicatorsLoading: indicatorsLoadingReducer
});

function partnerActivitiesListReducer(state = [], action: any) {
  switch (action.type) {
    case Constants.SET_PARTNER_ACTIVITIES_LIST:
      return action.data.results;

    case Constants.RESET:
      return [];

    default:
      return state;
  }
}

function partnerActivitiesCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_PARTNER_ACTIVITIES_COUNT:
      return action.count;

    default:
      return state;
  }
}

function loadingPartnerActivitiesReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.PARTNER_ACTIVITIES_LOADING_START:
      return true;

    case Constants.PARTNER_ACTIVITIES_LOADING_STOP:
      return false;

    default:
      return state;
  }
}

// // Activities

// function activitiesByPartnerProjectIdReducer(state, action: any) {
//   if (typeof state === 'undefined') {
//     state = {};
//   }

//   switch (action.type) {
//     case Constants.SET_ACTIVITIES_BY_PARTNER_PROJECT_ID:
//       return (function () {
//         var change = {};

//         change[action.partnerProjectId] = action.data;
//         return Object.assign({}, state, change);
//       }());

//     case Constants.RESET:
//       return {};

//     default:
//       return state;
//   }
// }

// function activitiesByPartnerProjectIdCountReducer(state, action: any) {
//   if (typeof state === 'undefined') {
//     state = 0;
//   }

//   switch (action.type) {
//     case Constants.SET_ACTIVITIES_BY_PARTNER_PROJECT_ID_COUNT:
//       return (function () {
//         var change = {};
//         change[action.partnerProjectId] = action.count;
//         return Object.assign({}, state, change);
//       }());

//     default:
//       return state;
//   }
// }

// function activitiesByPartnerProjectIdLoadingReducer(state, action: any) {
//   if (typeof state === 'undefined') {
//     state = false;
//   }

//   switch (action.type) {
//     case Constants.ACTIVITIES_BY_PARTNER_PROJECT_ID_LOADING_START:
//       return true;

//     case Constants.ACTIVITIES_BY_PARTNER_PROJECT_ID_LOADING_STOP:
//       return false;

//     default:
//       return state;
//   }
// }

function indicatorsReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_INDICATORS_BY_PARTNER_ACTIVITY_ID:
      return (function () {
        const change: GenericObject = {};

        change[action.partnerActivityId] = action.data;
        return Object.assign({}, state, change);
      })();

    case Constants.RESET:
      return {};

    default:
      return state;
  }
}

function indicatorsCountReducer(state = 0, action: any) {
  switch (action.type) {
    case Constants.SET_INDICATORS_BY_PARTNER_ACTIVITY_ID_COUNT:
      return (function () {
        const change: GenericObject = {};

        change[action.partnerActivityId] = action.count;
        return Object.assign({}, state, change);
      })();

    default:
      return state;
  }
}

function indicatorsLoadingReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.INDICATORS_BY_PARTNER_ACTIVITY_ID_LOADING_START:
      return true;

    case Constants.INDICATORS_BY_PARTNER_ACTIVITY_ID_LOADING_STOP:
      return false;

    default:
      return state;
  }
}
