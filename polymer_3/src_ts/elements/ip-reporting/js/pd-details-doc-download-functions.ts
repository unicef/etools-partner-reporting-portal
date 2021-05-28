import Endpoints from '../../../endpoints';

export function computeDocUrl(locationId: string, pdId: string) {
  return pdId ? Endpoints.programmeDocumentDocDownload(locationId, pdId) : '';
}
