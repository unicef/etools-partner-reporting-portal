import { createSelector } from 'reselect';
function selectCurrentReportId(state) {
    return state.programmeDocumentReports.current.id;
}
function selectAttachmentsByReport(state) {
    return state.programmeDocumentReportsAttachments.byReport;
}
function selectAttachmentsPendingByReport(state) {
    return state.programmeDocumentReportsAttachments.pendingByReport;
}
function prop(obj, prop) {
    return obj[prop];
}
// App.Selectors.ProgrammeDocumentReportsAttachments
export const programmeDocumentReportsAttachmentsCurrent = createSelector(selectAttachmentsByReport, selectCurrentReportId, prop);
export const programmeDocumentReportsAttachmentsPending = createSelector(selectAttachmentsPendingByReport, selectCurrentReportId, prop);
