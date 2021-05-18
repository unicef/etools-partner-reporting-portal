import Endpoints from '../../../etools-prp-common/endpoints';

export function computeIndicatorsUrl(locationId: string) {
  return Endpoints.allPDIndicators(locationId);
}
