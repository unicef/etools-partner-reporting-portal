import Constants from '../../constants';
import {combineReducers} from 'redux';
import {GenericObject} from '../../typings/globals.types';

export class DisaggregationsState {
  byIndicator: GenericObject = {};
}

export const Disaggregations = combineReducers({
  byIndicator: disaggregationsByIndicatorReducer
});

function disaggregationsByIndicatorReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_DISAGGREGATIONS:
      return (function () {
        const change: GenericObject = {};

        change[action.indicatorId] = action.data;

        return Object.assign({}, state, change);
      })();

    case Constants.SET_DISAGGREGATIONS_FOR_LOCATION:
      return (function () {
        const newState: GenericObject = Object.assign({}, state);
        let locations;
        let index;

        try {
          locations = newState[action.indicatorId].indicator_location_data;

          index = locations.findIndex(function (item: any) {
            return item.location.id === action.locationId;
          });

          locations[index] = Object.assign(locations[index], action.data);
          // eslint-disable-next-line no-empty
        } catch (err) {}

        return newState;
      })();

    case Constants.SET_PROGRESS_FOR_LOCATION:
      return (function () {
        const newState: GenericObject = Object.assign({}, state);
        let locations;
        let index;

        try {
          locations = newState[action.indicatorId].indicator_location_data;

          index = locations.findIndex(function (item: GenericObject) {
            return item.location.id === action.locationId;
          });

          locations[index].location_progress = action.value;
        } catch (err) {
          console.log(err);
        }

        return newState;
      })();

    case Constants.RESET:
      return {};

    default:
      return state;
  }
}
