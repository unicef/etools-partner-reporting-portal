import Endpoints from '../../../endpoints';

export function computePdReportsUrl(locationId: string) {
  return locationId ? Endpoints.programmeDocumentReports(locationId) : '';
}

export function hasResults(totalResults: number) {
  return totalResults > 0;
}
