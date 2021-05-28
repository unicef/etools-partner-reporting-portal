const BASE_URL = '/api'; // TODO: versioning?

const Endpoints = {
  _buildUrl(tail: string) {
    return BASE_URL + tail;
  },

  login() {
    return '/social/login/azuread-b2c-oauth2/';
  },

  config() {
    return this._buildUrl('/core/configuration/');
  },

  interventions() {
    return this._buildUrl('/core/workspace/');
  },

  indicators(content_object: string) {
    return this._buildUrl('/indicator/' + content_object);
  },

  allPDIndicators(workspaceId: string) {
    return this._buildUrl('/unicef/' + workspaceId + '/programme-document/indicators/');
  },

  indicatorReports(reportableId: string) {
    return this._buildUrl('/indicator/' + reportableId + '/indicator-reports/');
  },

  indicatorReportReview(reportId: string) {
    return this._buildUrl('/indicator/indicator-reports/' + reportId + '/review/');
  },

  programmeDocuments(locationId: string) {
    return this._buildUrl('/unicef/' + locationId + '/programme-document/');
  },

  programmeDocumentDetail(locationId: string, pdId: string) {
    return this._buildUrl('/unicef/' + locationId + '/programme-document/' + pdId);
  },
  programmeDocumentDocDownload(locationId: string, pdId: string) {
    return this._buildUrl('/unicef/' + locationId + '/programme-document/' + pdId + '/pmp-document/');
  },

  programmeDocumentReports(workspaceId: string) {
    return this._buildUrl('/unicef/' + workspaceId + '/progress-reports/');
  },

  programmeDocumentReport(workspaceId: string, reportId: string) {
    return this.programmeDocumentReports(workspaceId) + reportId + '/';
  },

  programmeDocumentImportTemplate(workspaceId: string, reportId: string) {
    return this.programmeDocumentReport(workspaceId, reportId) + 'export/';
  },

  programmeDocumentImport(workspaceId: string, reportId: string) {
    return this.programmeDocumentReport(workspaceId, reportId) + 'import/';
  },

  programmeDocumentReportSubmit(workspaceId: string, reportId: string) {
    return this.programmeDocumentReport(workspaceId, reportId) + 'submit/';
  },

  programmeDocumentReportSubmitSpecial(workspaceId: string, reportId: string) {
    return this.programmeDocumentReportSubmit(workspaceId, reportId) + 'sr/';
  },

  reportProgressReset() {
    return this._buildUrl('/indicator/report-refresh/');
  },

  programmeDocumentReportUpdate(workspaceId: string, reportId: string) {
    return this.programmeDocumentReport(workspaceId, reportId) + 'update/';
  },

  calculationMethods(workspaceId: string, pdId: string) {
    return this._buildUrl('/unicef/' + workspaceId + '/programme-document/' + pdId + '/calculation-methods/');
  },

  progressReports(locationId: string) {
    return this._buildUrl('/unicef/' + locationId + '/progress-reports/');
  },

  responsePlans(workspaceId: string) {
    return this._buildUrl('/core/workspace/' + workspaceId + '/response-plan/');
  },

  locations(workspaceId: string) {
    return this._buildUrl('/unicef/' + workspaceId + '/programme-document/locations/');
  },

  childLocations(locationId: string) {
    return this._buildUrl('/core/' + locationId + '/children-location/');
  },

  indicatorData(reportId: string) {
    return this._buildUrl('/indicator/indicator-data/' + reportId + '/');
  },

  indicatorDataLocation(workspaceId: string, reportId: string) {
    return this._buildUrl('/unicef/' + workspaceId + '/progress-reports/' + reportId + '/locations/');
  },

  reportable(programmeDocumentProgressReportId: string, lowerLevelOutputId: string) {
    return this._buildUrl(
      '/indicator/pd-progress-report/' + programmeDocumentProgressReportId + '/llo/' + lowerLevelOutputId + '/'
    );
  },

  indicatorLocationDataEntries() {
    return this._buildUrl('/indicator/indicator-location-data-entries/');
  },

  indicatorPullData(workspaceId: string, reportId: string, indicatorId: string) {
    return this._buildUrl(
      '/unicef/' + workspaceId + '/progress-reports/' + reportId + '/indicators/' + indicatorId + '/pull/'
    );
  },

  reportExport(locationId: string, reportId: string) {
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

  progressReportAttachments(locationId: string, reportId: string) {
    return this.progressReports(locationId) + reportId + '/attachments/';
  },

  progressReportAttachmentDetail(locationId: string, reportId: string, attachmentId: string) {
    return this.progressReports(locationId) + reportId + '/attachments/' + attachmentId + '/';
  }
};

export default Endpoints;
