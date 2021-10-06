const BASE_URL = '/api'; // TODO: versioning?
const Endpoints = {
    _buildUrl(tail) {
        return BASE_URL + tail;
    },
    login() {
        return '/social/login/azuread-b2c-oauth2/';
    },
    interventions() {
        return this._buildUrl('/core/workspace/');
    },
    allPDIndicators(workspaceId) {
        return this._buildUrl('/unicef/' + workspaceId + '/programme-document/indicators/');
    },
    indicatorReports(reportableId) {
        return this._buildUrl('/indicator/' + reportableId + '/indicator-reports/');
    },
    programmeDocuments(locationId) {
        return this._buildUrl('/unicef/' + locationId + '/programme-document/');
    },
    programmeDocumentDetail(locationId, pdId) {
        return this._buildUrl('/unicef/' + locationId + '/programme-document/' + pdId);
    },
    programmeDocumentDocDownload(locationId, pdId) {
        return this._buildUrl('/unicef/' + locationId + '/programme-document/' + pdId + '/pmp-document/');
    },
    programmeDocumentReports(workspaceId) {
        return this._buildUrl('/unicef/' + workspaceId + '/progress-reports/');
    },
    programmeDocumentReport(workspaceId, reportId) {
        return this.programmeDocumentReports(workspaceId) + reportId + '/';
    },
    programmeDocumentImportTemplate(workspaceId, reportId) {
        return this.programmeDocumentReport(workspaceId, reportId) + 'export/';
    },
    programmeDocumentImport(workspaceId, reportId) {
        return this.programmeDocumentReport(workspaceId, reportId) + 'import/';
    },
    programmeDocumentReportSubmit(workspaceId, reportId) {
        return this.programmeDocumentReport(workspaceId, reportId) + 'submit/';
    },
    programmeDocumentReportSubmitSpecial(workspaceId, reportId) {
        return this.programmeDocumentReportSubmit(workspaceId, reportId) + 'sr/';
    },
    reportProgressReset() {
        return this._buildUrl('/indicator/report-refresh/');
    },
    programmeDocumentReportUpdate(workspaceId, reportId) {
        return this.programmeDocumentReport(workspaceId, reportId) + 'update/';
    },
    calculationMethods(workspaceId, pdId) {
        return this._buildUrl('/unicef/' + workspaceId + '/programme-document/' + pdId + '/calculation-methods/');
    },
    progressReports(locationId) {
        return this._buildUrl('/unicef/' + locationId + '/progress-reports/');
    },
    locations(workspaceId) {
        return this._buildUrl('/unicef/' + workspaceId + '/programme-document/locations/');
    },
    indicatorDataLocation(workspaceId, reportId) {
        return this._buildUrl('/unicef/' + workspaceId + '/progress-reports/' + reportId + '/locations/');
    },
    reportable(programmeDocumentProgressReportId, lowerLevelOutputId) {
        return this._buildUrl('/indicator/pd-progress-report/' + programmeDocumentProgressReportId + '/llo/' + lowerLevelOutputId + '/');
    },
    indicatorLocationDataEntries() {
        return this._buildUrl('/indicator/indicator-location-data-entries/');
    },
    indicatorPullData(workspaceId, reportId, indicatorId) {
        return this._buildUrl('/unicef/' + workspaceId + '/progress-reports/' + reportId + '/indicators/' + indicatorId + '/pull/');
    },
    reportExport(locationId, reportId) {
        return this._buildUrl('/unicef/' + locationId + '/progress-reports/' + reportId + '/annex-C-export-PDF/');
    },
    userSignOut() {
        return this._buildUrl('/account/user-logout/');
    },
    userLogin() {
        return this._buildUrl('/account/auth/get-token/');
    },
    userLoginToken() {
        return this._buildUrl('/account/auth/login-with-token/');
    },
    userProfile() {
        return this._buildUrl('/account/user-profile/');
    },
    currencies() {
        return this._buildUrl('/core/currencies/');
    },
    progressReportAttachments(locationId, reportId) {
        return this.progressReports(locationId) + reportId + '/attachments/';
    },
    progressReportAttachmentDetail(locationId, reportId, attachmentId) {
        return this.progressReports(locationId) + reportId + '/attachments/' + attachmentId + '/';
    }
};
export default Endpoints;
