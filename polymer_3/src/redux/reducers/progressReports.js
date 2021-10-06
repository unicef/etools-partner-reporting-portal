import { combineReducers } from 'redux';
import Constants from '../../etools-prp-common/constants';
export class ProgressReportsState {
    constructor() {
        this.all = [];
        this.count = 0;
        this.loading = false;
    }
}
export const ProgressReports = combineReducers({
    all: allProgressReportsReducer,
    count: ProgressReportsCountReducer,
    loading: loadingProgressReportsReducer
});
function allProgressReportsReducer(state = [], action) {
    switch (action.type) {
        case Constants.SET_PROGRESS_REPORTS:
            return action.data.slice();
        case Constants.RESET:
            return [];
        default:
            return state;
    }
}
function ProgressReportsCountReducer(state = false, action) {
    switch (action.type) {
        case Constants.SET_PROGRESS_REPORTS_COUNT:
            return action.count;
        default:
            return state;
    }
}
function loadingProgressReportsReducer(state = false, action) {
    switch (action.type) {
        case Constants.PROGRESS_REPORTS_LOADING_START:
            return true;
        case Constants.PROGRESS_REPORTS_LOADING_STOP:
            return false;
        default:
            return state;
    }
}
