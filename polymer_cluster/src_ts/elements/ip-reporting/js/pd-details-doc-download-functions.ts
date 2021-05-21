import Endpoints from '../../../etools-prp-common/endpoints';

export function computeDocUrl(locationId: string, pdId: string) {
  return pdId ? Endpoints.programmeDocumentDocDownload(locationId, pdId) : '';
}
