import Endpoints from '../../../endpoints';

export function computePDReportsUrl(locationId: string) {
  return locationId ? Endpoints.programmeDocumentReports(locationId) : '';
}

export function computegPDReportsUrl(locationId: string) {
  return locationId ? Endpoints.programmegPDListDocumentReports(locationId) : '';
}

export function computePDReportsParams(pdId: string, queryParams: any) {
  return Object.assign({}, queryParams, {
    programme_document: pdId
  });
}
