import Endpoints from '../../../endpoints';
export function computeImportTemplateUrl(locationId, reportId) {
    return Endpoints.programmeDocumentImportTemplate(locationId, reportId);
}
export function computeImportUrl(locationId, reportId) {
    return Endpoints.programmeDocumentImport(locationId, reportId);
}
export function computePdReportUrl(locationId, reportId) {
    return Endpoints.programmeDocumentReport(locationId, reportId);
}
export function computeShowImportButtons(programmeDocument) {
    // How will this ever evaluate to false? Possible TODO
    return programmeDocument.status !== 'Sub' && programmeDocument.status !== 'Acc';
}
export function computeRefreshData(reportId) {
    return { report_id: reportId, report_type: 'PR' };
}
export function computeCanRefresh(report, programmeDocument) {
    switch (true) {
        case programmeDocument && (programmeDocument.status === 'Sig' || programmeDocument.status === 'Clo'):
        case programmeDocument && report.report_type === 'SR':
            return false;
        default:
            return true;
    }
}
export function computeShowRefresh(roles) {
    return roles.every(function (role) {
        return role.role !== 'IP_ADMIN' && role.role !== 'IP_VIEWER';
    });
}
