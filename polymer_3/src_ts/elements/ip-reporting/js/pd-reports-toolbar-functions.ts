import Endpoints from '../../../etools-prp-common/endpoints';

export function computePdReportsUrl(locationId: string) {
  return Endpoints.programmeDocumentReports(locationId);
}

export function canExport(totalResults: number) {
  return totalResults > 0;
}

export function computePdQuery(pdId: string) {
  return {
    programme_document: pdId
  };
}
