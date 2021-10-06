import { combineReducers } from 'redux';
import Constants from '../../etools-prp-common/constants';
export class ProgrammeDocumentsState {
    constructor() {
        this.all = [];
        this.current = '';
        this.count = 0;
        this.loading = false;
    }
}
export const ProgrammeDocuments = combineReducers({
    all: allPDsReducer,
    current: currentPDReducer,
    count: PDsCountReducer,
    loading: loadingPDsReducer
});
function allPDsReducer(state = [], action) {
    switch (action.type) {
        case Constants.SET_PROGRAMME_DOCUMENTS:
            return action.data.slice();
        case Constants.RESET:
            return [];
        default:
            return state;
    }
}
function currentPDReducer(state = '', action) {
    switch (action.type) {
        case Constants.SET_CURRENT_PD:
            return action.pdId;
        case Constants.RESET:
            return '';
        default:
            return state;
    }
}
function PDsCountReducer(state = 0, action) {
    switch (action.type) {
        case Constants.SET_PROGRAMME_DOCUMENTS_COUNT:
            return action.count;
        default:
            return state;
    }
}
function loadingPDsReducer(state = false, action) {
    switch (action.type) {
        case Constants.PROGRAMME_DOCUMENTS_LOADING_START:
            return true;
        case Constants.PROGRAMME_DOCUMENTS_LOADING_STOP:
            return false;
        default:
            return state;
    }
}
