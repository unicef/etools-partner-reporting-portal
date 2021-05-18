import {GenericObject} from '../../../etools-prp-common/typings/globals.types';
import Endpoints from '../../../etools-prp-common/endpoints';

export function computeUpdateUrl(locationId: string, reportId: string) {
  return Endpoints.programmeDocumentReportUpdate(locationId, reportId);
}

// @ts-ignore
export function computeMode(mode: string, overrideMode: string, report: any, permissions: GenericObject) {
  return permissions && permissions.savePdReport ? overrideMode || mode : 'view';
}
