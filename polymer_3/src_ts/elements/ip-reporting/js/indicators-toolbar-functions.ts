import Endpoints from '../../../endpoints';

export function computeIndicatorsUrl(locationId: string) {
  return Endpoints.allPDIndicators(locationId);
}
