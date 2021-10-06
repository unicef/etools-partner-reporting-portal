import Constants from '../../etools-prp-common/constants';
import { combineReducers } from 'redux';
export class DisaggregationsState {
    constructor() {
        this.byIndicator = {};
    }
}
export const Disaggregations = combineReducers({
    byIndicator: disaggregationsByIndicatorReducer
});
function disaggregationsByIndicatorReducer(state = {}, action) {
    switch (action.type) {
        case Constants.SET_DISAGGREGATIONS:
            return (function () {
                const change = {};
                change[action.indicatorId] = action.data;
                return Object.assign({}, state, change);
            })();
        case Constants.SET_DISAGGREGATIONS_FOR_LOCATION:
            return (function () {
                const newState = Object.assign({}, state);
                let locations;
                let index;
                try {
                    locations = newState[action.indicatorId].indicator_location_data;
                    index = locations.findIndex(function (item) {
                        return item.location.id === action.locationId;
                    });
                    locations[index] = Object.assign(locations[index], action.data);
                    // eslint-disable-next-line no-empty
                }
                catch (err) { }
                return newState;
            })();
        case Constants.SET_PROGRESS_FOR_LOCATION:
            return (function () {
                const newState = Object.assign({}, state);
                let locations;
                let index;
                try {
                    locations = newState[action.indicatorId].indicator_location_data;
                    index = locations.findIndex(function (item) {
                        return item.location.id === action.locationId;
                    });
                    locations[index].location_progress = action.value;
                }
                catch (err) {
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
