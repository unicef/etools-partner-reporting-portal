import Endpoints from '../../../endpoints';
export function computeDocUrl(locationId, pdId) {
    return pdId ? Endpoints.programmeDocumentDocDownload(locationId, pdId) : '';
}
