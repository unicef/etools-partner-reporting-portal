import Endpoints from '../../../endpoints';

export function computePdUrl(locationId: string) {
  return Endpoints.programmeDocuments(locationId);
}
