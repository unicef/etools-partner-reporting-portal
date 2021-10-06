import { createSelector } from 'reselect';
function getAllPD(state) {
    return state.programmeDocuments.all;
}
function getCurrentPDId(state) {
    return state.programmeDocuments.current;
}
function getCurrentPD(pds, currentPdId) {
    return pds.filter(function (pd) {
        return pd.id === currentPdId;
    })[0] || {};
}
export const loadedProgrammeDocuments = createSelector(getAllPD, (docs) => !!docs.length);
export const currentProgrammeDocument = createSelector(getAllPD, getCurrentPDId, getCurrentPD);
export const programmeDocuments_CurrentAuthorizedPartners = createSelector(getAllPD, getCurrentPDId, function (allPDs, pdId) {
    return (getCurrentPD(allPDs, pdId).partner_focal_point || []).filter(function (officer) {
        return officer.is_authorized_officer;
    }).map(function (focalPoint) {
        return {
            value: focalPoint.email, title: focalPoint.name + ' ' + focalPoint.title,
        };
    });
});
