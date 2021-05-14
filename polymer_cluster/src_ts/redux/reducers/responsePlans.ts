import {combineReducers} from 'redux';
import Constants from '../../constants';
import {GenericObject} from '../../typings/globals.types';

export class ResponsePlansState {
  all = [];
  current = null;
  currentID = '';
}

export const ResponsePlans = combineReducers({
  all: allResponsePlansReducer,
  current: currentResponsePlanReducer,
  currentID: currentResponsePlanIdReducer
});

function allResponsePlansReducer(state: GenericObject[] = [], action: any) {
  switch (action.type) {
    case Constants.SET_RESPONSE_PLANS:
      return action.plans;
    case Constants.ADD_RESPONSE_PLAN:
      return state.concat([action.plan]);
    case Constants.RESET:
      return [];

    default:
      return state;
  }
}

function currentResponsePlanIdReducer(state = '', action: any) {
  switch (action.type) {
    // Setting plan and plan ID separately to avoid type issues.
    case Constants.SET_CURRENT_RESPONSE_PLAN_ID:
      return action.planID;

    case Constants.RESET:
      return '';

    default:
      return state;
  }
}

function currentResponsePlanReducer(state = null, action: any) {
  switch (action.type) {
    case Constants.SET_CURRENT_RESPONSE_PLAN:
      return action.plan;

    case Constants.RESET:
      return null;

    default:
      return state;
  }
}
