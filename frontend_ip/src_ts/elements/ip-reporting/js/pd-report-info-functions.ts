import Endpoints from '../../../endpoints';

export function computeUpdateUrl(locationId: string, reportId: string) {
  return Endpoints.programmeDocumentReportUpdate(locationId, reportId);
}

// @ts-ignore
export function computeMode(mode: string, overrideMode: string, report: any, permissions: any) {
  return permissions && permissions.savePdReport ? overrideMode || mode : 'view';
}
