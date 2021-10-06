import { createSelector } from 'reselect';
// use instead of App.Selectors.Partner.loading
export const partnerLoading = createSelector((state) => state.partner.current, (currentPartner) => {
    return typeof currentPartner.id === 'undefined';
});
