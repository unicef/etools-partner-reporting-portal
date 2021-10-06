import Endpoints from '../../../endpoints';
export function computeUpdateUrl(locationId, reportId) {
    return Endpoints.programmeDocumentReportUpdate(locationId, reportId);
}
// @ts-ignore
export function computeMode(mode, overrideMode, report, permissions) {
    return permissions && permissions.savePdReport ? overrideMode || mode : 'view';
}
