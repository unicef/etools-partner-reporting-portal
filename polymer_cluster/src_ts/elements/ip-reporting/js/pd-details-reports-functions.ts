import Endpoints from '../../../endpoints';
import {GenericObject} from '../../../typings/globals.types';

export function computePDReportsUrl(locationId: string) {
  return locationId ? Endpoints.programmeDocumentReports(locationId) : '';
}

export function computePDReportsParams(pdId: string, queryParams: GenericObject) {
  return Object.assign({}, queryParams, {
    programme_document: pdId
  });
}
