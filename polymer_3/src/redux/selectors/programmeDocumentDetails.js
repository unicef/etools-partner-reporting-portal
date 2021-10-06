import { createSelector } from 'reselect';
// App.Selectors.ProgrammeDocumentDetails
export const programmeDocumentDetailsLoading = createSelector(function (state) {
    return state.programmeDocumentDetails.current;
}, function (currentPDDetails) {
    return typeof currentPDDetails.id === 'undefined';
});
