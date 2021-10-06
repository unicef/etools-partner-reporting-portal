import { createSelector } from 'reselect';
// App.Selectors.ProgrammeDocumentIndicators
export const pdIndicatorsAll = createSelector(pdId, pick('byPd'), byPd);
export const pdIndicatorsLoading = createSelector(pdId, pick('loading'), byPd);
function pdId(state) {
    return state.programmeDocuments.current;
}
function byPd(pdId, data) {
    return data[pdId];
}
function pick(key) {
    return function (state) {
        // @ts-ignore
        return state.programmeDocumentsIndicators[key];
    };
}
