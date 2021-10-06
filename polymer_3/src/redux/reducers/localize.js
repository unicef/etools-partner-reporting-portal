import Constants from '../../etools-prp-common/constants';
import { combineReducers } from 'redux';
let availableLangs;
const defaultLanguage = 'en';
export class LocaLizeState {
    constructor() {
        this.language = defaultLanguage;
        this.resources = [];
    }
}
export const Localize = combineReducers({
    language: languageReducer,
    resources: resourcesReducer
});
function languageReducer(state, action) {
    if (typeof state === 'undefined') {
        let currentLanguage = localStorage.getItem('defaultLanguage');
        if (!currentLanguage) {
            currentLanguage = navigator.language.split('-')[0];
        }
        state = currentLanguage;
    }
    if (availableLangs !== undefined && !availableLangs.includes(state)) {
        state = defaultLanguage;
    }
    switch (action.type) {
        case Constants.SET_LANGUAGE:
            return action.language;
        default:
            return state;
    }
}
function resourcesReducer(state = [], action) {
    switch (action.type) {
        case Constants.SET_L11N_RESOURCES:
            availableLangs = Object.keys(action.resources);
            return action.resources;
        default:
            return state;
    }
}
