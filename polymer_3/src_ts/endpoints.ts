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

  responseParametersClusterObjectives(responsePlanId: string) {
    return this._buildUrl('/cluster/' + responsePlanId + '/cluster-objective-list/');
  },

  responseParametersClusterDisaggregations(responsePlanId: string) {
    return this._buildUrl('/indicator/response-plan/' + responsePlanId + '/disaggregations/');
  },

  responseParametersClusterActivities(responsePlanId: string) {
    return this._buildUrl('/cluster/' + responsePlanId + '/cluster-activity-list/');
  },

  clusterActivities(clusterId: string) {
    return this._buildUrl('/cluster/' + clusterId + '/cluster-activity-list/');
  },

  plannedActions(responsePlanId: string) {
    return this._buildUrl('/partner/' + responsePlanId + '/partner-project-list/');
  },

  plannedActionsIMO(responsePlanId: string, partnerId: string) {
    return this._buildUrl('/partner/' + responsePlanId + '/partner-project-list/partner/' + partnerId + '/');
  },

  // @ts-ignore
  plannedActionsIMOEdit(responsePlanId: string, partnerId: string, projectId: string) {
    return this._buildUrl('/partner/partner-project-details/partner/' + partnerId + '/' + projectId + '/');
  },

  plannedActionsProjectOverview(projectId: string) {
    return this._buildUrl('/partner/partner-project-details/' + projectId + '/');
  },

  plannedActionsActivityOverview(responsePlanId: string, activityId: string) {
    return this._buildUrl('/partner/' + responsePlanId + '/partner-activity/' + activityId + '/');
  },

  responseParametersClustersObjectiveDetail(objectiveId: string) {
    return this._buildUrl('/cluster/cluster-objective/' + objectiveId + '/');
  },

  responseParamtersClustersActivityDetail(activityId: string) {
    return this._buildUrl('/cluster/cluster-activity/' + activityId + '/');
  },

  clusterIndicatorReports(responsePlanId: string) {
    return this._buildUrl('/cluster/' + responsePlanId + '/cluster-indicator-reports/');
  },

  clusterIndicatorReport(responsePlanId: string, reportId: string) {
    return this.clusterIndicatorReports(responsePlanId) + reportId + '/';
  },

  clusterIndicatorReportsImportTemplate(responsePlanId: string) {
    return this.clusterIndicatorReports(responsePlanId) + 'export/';
  },

  clusterIndicatorReportsExport(responsePlanId: string) {
    return this.clusterIndicatorReports(responsePlanId) + 'export-for-analysis/';
  },

  clusterIndicatorReportsImport(responsePlanId: string) {
    return this.clusterIndicatorReports(responsePlanId) + 'import/';
  },

  clusterIndicatorNames(responsePlanId: string) {
    return this._buildUrl('/cluster/' + responsePlanId + '/cluster-reportable-simple-list/');
  },

  clusterNames(responsePlanId: string) {
    return this._buildUrl('/cluster/' + responsePlanId + '/cluster-simple-list/');
  },

  clusterProjectNames(responsePlanId: string) {
    return this._buildUrl('/partner/' + responsePlanId + '/partner-project-simple-list/');
  },

  clusterPartnerNames(responsePlanId: string) {
    return this._buildUrl('/partner/' + responsePlanId + '/partner-simple-list/');
  },

  clusterLocationNames(responsePlanId: string) {
    return this._buildUrl('/core/' + responsePlanId + '/location/');
  },

  clusterIndicators() {
    return this._buildUrl('/indicator/cluster-indicator/');
  },

  adoptedClusterIndicators() {
    return this._buildUrl('/indicator/partner-project-indicator-adopt/');
  },

  partnerActivity(responsePlanId: string, mode: string) {
    return this._buildUrl('/partner/' + responsePlanId + '/create-partner-activity/' + mode);
  },

  partnerActivityUpdate(responsePlanId: string, activityId: string) {
    return this._buildUrl('/partner/' + responsePlanId + '/update-partner-activity/' + activityId + '/');
  },

  partnersByClusterActivityId(clusterActivityId: string) {
    return this._buildUrl('/partner/cluster-activity/' + clusterActivityId + '/partners/');
  },

  partnerActivityList(responsePlanId: string) {
    return this._buildUrl('/partner/' + responsePlanId + '/partner-activity-list/');
  },

  reportExport(locationId: string, reportId: string) {
    return this._buildUrl('/unicef/' + locationId + '/progress-reports/' + reportId + '/annex-C-export-PDF/');
  },

  clusterDashboard(responsePlanId: string, mode: string) {
    return this._buildUrl('/cluster/' + responsePlanId + '/' + mode + '-dashboard/');
  },

  clusterIndicatorLocations(responsePlanId: string) {
    return this._buildUrl('/cluster/' + responsePlanId + '/cluster-indicators-locations/');
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
  },

  analysisOperationalPresence(responsePlanId: string, type: string) {
    return this._buildUrl('/cluster/cluster-analysis/' + responsePlanId + '/operational-presence/' + type);
  },

  analysisIndicators(responsePlanId: string) {
    return this._buildUrl('/cluster/cluster-analysis/' + responsePlanId + '/indicators/');
  },

  analysisIndicator(responsePlanId: string, indicatorId: string) {
    return this.analysisIndicators(responsePlanId) + indicatorId;
  },

  indicatorPerLocationVars(reportableId: string) {
    return this._buildUrl('/indicator/' + reportableId + '/baseline_in_need');
  },

  indicatorIMOMessage() {
    return this._buildUrl('/indicator/cluster-indicator-imo-message/');
  },

  ochaResponsePlans(workspaceId: string) {
    return this._buildUrl('/ocha/response-plans/workspace/' + workspaceId + '/');
  },

  ochaResponsePlanDetails(planId: string) {
    return this._buildUrl('/ocha/response-plans/' + planId + '/');
  },

  customResponsePlan(workspaceId: string) {
    return this._buildUrl('/core/workspace/' + workspaceId + '/response-plan/create/');
  },

  ochaProjectsList(responsePlanId: string) {
    return this._buildUrl('/ocha/projects/response-plan/' + responsePlanId + '/');
  },

  ochaProjectDetails(projectId: string) {
    return this._buildUrl('/ocha/projects/' + projectId + '/');
  }
};

export default Endpoints;
