function PdOutputListToolbarUtils() {

}

PdOutputListToolbarUtils.computeImportTemplateUrl = function(locationId, reportId) {
    return App.Endpoints.programmeDocumentImportTemplate(locationId, reportId);
};

PdOutputListToolbarUtils.computeImportUrl = function(locationId, reportId) {
    return App.Endpoints.programmeDocumentImport(locationId, reportId);
};

PdOutputListToolbarUtils.computePdReportUrl = function(locationId, reportId) {
    return App.Endpoints.programmeDocumentReport(locationId, reportId);
};

PdOutputListToolbarUtils.computeShowImportButtons = function(programmeDocument) {
    // How will this ever evaluate to false? Possible TODO
    return programmeDocument.status !== 'Sub' && programmeDocument.status !== 'Acc';
};

PdOutputListToolbarUtils.computeRefreshData = function(reportId) {
    return {'report_id': reportId, 'report_type': 'PR'};
};

PdOutputListToolbarUtils.computeCanRefresh = function(report, programmeDocument) {
    switch (true) {
        case programmeDocument &&
            (programmeDocument.status === 'Sig'
            || programmeDocument.status === 'Clo'):
        case programmeDocument && report.report_type === 'SR':
            return false;

        default:
            return true;
    }
};

PdOutputListToolbarUtils.computeShowRefresh = function(roles) {
    return roles.every(function (role) {
        return role.role !== 'IP_ADMIN' && role.role !== 'IP_VIEWER';
    });
};

try {
    module.exports = exports = PdOutputListToolbarUtils;
} catch (e) {}
