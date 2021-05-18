import Endpoints from '../../../etools-prp-common/endpoints';

export function computePdUrl(locationId: string) {
  return Endpoints.programmeDocuments(locationId);
}
