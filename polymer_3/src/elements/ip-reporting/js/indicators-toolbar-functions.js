import Endpoints from '../../../endpoints';
export function computeIndicatorsUrl(locationId) {
    return Endpoints.allPDIndicators(locationId);
}
