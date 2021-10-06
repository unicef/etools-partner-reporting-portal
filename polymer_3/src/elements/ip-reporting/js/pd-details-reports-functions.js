import Endpoints from '../../../endpoints';
export function computePDReportsUrl(locationId) {
    return locationId ? Endpoints.programmeDocumentReports(locationId) : '';
}
export function computePDReportsParams(pdId, queryParams) {
    return Object.assign({}, queryParams, {
        programme_document: pdId
    });
}
