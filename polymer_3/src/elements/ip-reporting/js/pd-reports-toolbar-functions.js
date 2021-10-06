import Endpoints from '../../../endpoints';
export function computePdReportsUrl(locationId) {
    return Endpoints.programmeDocumentReports(locationId);
}
export function canExport(totalResults) {
    return totalResults > 0;
}
export function computePdQuery(pdId) {
    return {
        programme_document: pdId
    };
}
