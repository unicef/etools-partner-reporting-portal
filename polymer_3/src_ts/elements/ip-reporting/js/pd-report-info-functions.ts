import {GenericObject} from '../../../typings/globals.types';
import Endpoints from '../../../endpoints';

export function computeUpdateUrl(locationId: string, reportId: string) {
  return Endpoints.programmeDocumentReportUpdate(locationId, reportId);
}

export function computeMode(mode: string, overrideMode: string, permissions: GenericObject) {
  return (permissions && permissions.savePdReport) ? (overrideMode || mode) : 'view';
}
