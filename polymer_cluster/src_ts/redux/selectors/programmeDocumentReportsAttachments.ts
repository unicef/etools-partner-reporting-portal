import {createSelector} from 'reselect';

function selectCurrentReportId(state: any) {
  return state.programmeDocumentReports.current.id;
}

function selectAttachmentsByReport(state: any) {
  return state.programmeDocumentReportsAttachments.byReport;
}

function selectAttachmentsPendingByReport(state: any) {
  return state.programmeDocumentReportsAttachments.pendingByReport;
}

function prop(obj: any, prop: string) {
  return obj[prop];
}

// App.Selectors.ProgrammeDocumentReportsAttachments
export const programmeDocumentReportsAttachmentsCurrent = createSelector(
  selectAttachmentsByReport,
  selectCurrentReportId,
  prop
);

export const programmeDocumentReportsAttachmentsPending = createSelector(
  selectAttachmentsPendingByReport,
  selectCurrentReportId,
  prop
);
