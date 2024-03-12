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

export function computeShowImportButtons(roles: any[], currentReport: GenericObject, programmeDocument: GenericObject) {
  return allowReportEdit(roles, currentReport, programmeDocument);
}

export function computeRefreshData(reportId: string) {
  return {report_id: reportId, report_type: 'PR'};
}

export function computeCanRefresh(roles: any[], report: GenericObject, programmeDocument: GenericObject) {
  if (!allowReportEdit(roles, report, programmeDocument)) {
    return false;
  }

  if (report.report_type === 'SR') {
    return false;
  }

  return true;
}

export function computeShowRefresh(roles: any[]) {
  return roles.some(function (role) {
    return role.role === 'IP_AUTHORIZED_OFFICER' || role.role === 'IP_EDITOR';
  });
}

export function allowReportEdit(roles: any[], report: GenericObject, programmeDocument: GenericObject) {
  if (roles.length === 1 && roles.includes('IP_VIEWER')) {
    return false;
  }

  // SHOUL WE CONSIDER: 'ended', 'terminated' ??
  if (programmeDocument && ['signed', 'closed'].includes(programmeDocument.status)) {
    return false;
  }

  if (['Sub', 'Acc', 'Ove'].includes(report.status)) {
    return false;
  }

  return true;
}
