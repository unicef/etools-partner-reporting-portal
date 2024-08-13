import Endpoints from '../../../endpoints';

export function computePdReportsUrl(locationId: string) {
  return locationId ? Endpoints.programmeDocumentReports(locationId) : '';
}

export function canExport(totalResults: number) {
  return totalResults > 0;
}

export function computePdQuery(pdId: string) {
  return {
    programme_document: pdId
  };
}
