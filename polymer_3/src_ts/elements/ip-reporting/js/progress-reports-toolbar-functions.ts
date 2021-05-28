import Endpoints from '../../../endpoints';

export function computePdReportsUrl(locationId: string) {
  return Endpoints.programmeDocumentReports(locationId);
}

export function canExport(totalResults: number) {
  return totalResults > 0;
}
