import Endpoints from '../../../endpoints';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

export function computeImportTemplateUrl(locationId: string, reportId: string) {
  return Endpoints.programmeDocumentImportTemplate(locationId, reportId);
}

export function computeImportUrl(locationId: string, reportId: string) {
  return Endpoints.programmeDocumentImport(locationId, reportId);
}

export function computePdReportUrl(locationId: string, reportId: string) {
  return Endpoints.programmeDocumentReport(locationId, reportId);
}

export function computeShowImportButtons(programmeDocument: GenericObject) {
  // How will this ever evaluate to false? Possible TODO
  return programmeDocument.status !== 'Sub' && programmeDocument.status !== 'Acc';
}

export function computeRefreshData(reportId: string) {
  return {report_id: reportId, report_type: 'PR'};
}

export function computeCanRefresh(report: GenericObject, programmeDocument: GenericObject) {
  switch (true) {
    case programmeDocument && (programmeDocument.status === 'Sig' || programmeDocument.status === 'Clo'):
    case programmeDocument && report.report_type === 'SR':
      return false;

    default:
      return true;
  }
}

export function computeShowRefresh(roles: any[]) {
  return roles.some(function (role) {
    return role.role === 'IP_AUTHORIZED_OFFICER' || role.role === 'IP_EDITOR';
  });
}
