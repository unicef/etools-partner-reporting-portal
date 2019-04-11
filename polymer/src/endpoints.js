'use strict';
function AppEndpoints() {

};

var BASE_URL = '/api'; // TODO: versioning?

AppEndpoints._buildUrl = function (tail) {
    return BASE_URL + tail;
}

AppEndpoints.login = function () {
    return '/social/login/azuread-b2c-oauth2/';
}

AppEndpoints.config = function () {
    return AppEndpoints._buildUrl('/core/configuration/');
}

AppEndpoints.interventions = function () {
    return AppEndpoints._buildUrl('/core/workspace/');
}

AppEndpoints.indicators = function (content_object) {
    return AppEndpoints._buildUrl('/indicator/' + content_object);
}

AppEndpoints.allPDIndicators = function (workspaceId) {
    return AppEndpoints._buildUrl('/unicef/' + workspaceId + '/programme-document/indicators/');
}

AppEndpoints.indicatorReports = function (reportableId) {
    return AppEndpoints._buildUrl('/indicator/' + reportableId + '/indicator-reports/');
}

AppEndpoints.indicatorReportReview = function (reportId) {
    return AppEndpoints._buildUrl('/indicator/indicator-reports/' + reportId + '/review/');
}

AppEndpoints.programmeDocuments = function (locationId) {
    return AppEndpoints._buildUrl('/unicef/' + locationId + '/programme-document/');
}

AppEndpoints.programmeDocumentDetail = function (locationId, pdId) {
    return AppEndpoints._buildUrl('/unicef/' + locationId + '/programme-document/' + pdId);
}
AppEndpoints.programmeDocumentDocDownload = function (locationId, pdId) {
    return AppEndpoints._buildUrl('/unicef/' + locationId +
        '/programme-document/' + pdId + '/pmp-document/');
}

AppEndpoints.programmeDocumentReports = function (workspaceId) {
    return AppEndpoints._buildUrl('/unicef/' + workspaceId + '/progress-reports/');
}

AppEndpoints.programmeDocumentReport = function (workspaceId, reportId) {
    return AppEndpoints.programmeDocumentReports(workspaceId) + reportId + '/';
}

AppEndpoints.programmeDocumentImportTemplate = function(workspaceId, reportId) {
    return AppEndpoints.programmeDocumentReport(workspaceId, reportId) + 'export/';
}

AppEndpoints.programmeDocumentImport = function(workspaceId, reportId) {
    return AppEndpoints.programmeDocumentReport(workspaceId, reportId) + 'import/';
}

AppEndpoints.programmeDocumentReportSubmit = function (workspaceId, reportId) {
    return AppEndpoints.programmeDocumentReport(workspaceId, reportId) + 'submit/';
}

AppEndpoints.programmeDocumentReportSubmitSpecial = function (workspaceId, reportId) {
    return AppEndpoints.programmeDocumentReportSubmit(workspaceId, reportId) + 'sr/';
}

AppEndpoints.reportProgressReset = function () {
    return AppEndpoints._buildUrl('/indicator/report-refresh/');
}

AppEndpoints.programmeDocumentReportUpdate = function (workspaceId, reportId) {
    return AppEndpoints.programmeDocumentReport(workspaceId, reportId) + 'update/';
}

AppEndpoints.calculationMethods = function (workspaceId, pdId) {
    return AppEndpoints._buildUrl(
        '/unicef/' +
        workspaceId +
        '/programme-document/' +
        pdId +
        '/calculation-methods/'
    );
}

AppEndpoints.progressReports = function(locationId) {
    return AppEndpoints._buildUrl('/unicef/' + locationId + '/progress-reports/');
}

AppEndpoints.responsePlans = function (workspaceId) {
    return AppEndpoints._buildUrl('/core/workspace/' + workspaceId + '/response-plan/');
}

AppEndpoints.locations = function (workspaceId) {
    return AppEndpoints._buildUrl('/unicef/' + workspaceId + '/programme-document/locations/');
}

AppEndpoints.childLocations = function (locationId) {
    return AppEndpoints._buildUrl('/core/' + locationId + '/children-location/');
}

AppEndpoints.indicatorData = function (reportId) {
    return AppEndpoints._buildUrl('/indicator/indicator-data/' + reportId + '/');
}

AppEndpoints.indicatorDataLocation = function (workspaceId, reportId) {
    return AppEndpoints._buildUrl(
        '/unicef/' +
        workspaceId +
        '/progress-reports/' +
        reportId +
        '/locations/'
    );
}

AppEndpoints.reportable = function (programmeDocumentProgressReportId, lowerLevelOutputId) {
    return AppEndpoints._buildUrl(
        '/indicator/pd-progress-report/' +
        programmeDocumentProgressReportId +
        '/llo/' +
        lowerLevelOutputId +
        '/'
    );
}

AppEndpoints.indicatorLocationDataEntries = function() {
    return AppEndpoints._buildUrl('/indicator/indicator-location-data-entries/');
}

AppEndpoints.indicatorPullData = function(workspaceId, reportId, indicatorId) {
    return AppEndpoints._buildUrl(
        '/unicef/' +
        workspaceId +
        '/progress-reports/' +
        reportId +
        '/indicators/' +
        indicatorId +
        '/pull/'
    );
}

AppEndpoints.responseParametersClusterObjectives = function(responsePlanId) {
    return AppEndpoints._buildUrl('/cluster/' + responsePlanId + '/cluster-objective-list/');
}

AppEndpoints.responseParametersClusterDisaggregations = function(responsePlanId) {
    return AppEndpoints._buildUrl('/indicator/response-plan/' + responsePlanId + '/disaggregations/');
}

AppEndpoints.responseParametersClusterActivities = function(responsePlanId) {
    return AppEndpoints._buildUrl('/cluster/' + responsePlanId + '/cluster-activity-list/');
}

AppEndpoints.clusterActivities = function (clusterId) {
    return AppEndpoints._buildUrl('/cluster/' + clusterId + '/cluster-activity-list/');
}

AppEndpoints.plannedActions = function(responsePlanId) {
    return AppEndpoints._buildUrl('/partner/' + responsePlanId + '/partner-project-list/');
}

AppEndpoints.plannedActionsIMO = function(responsePlanId, partnerId) {
    return AppEndpoints._buildUrl('/partner/' + responsePlanId + '/partner-project-list/partner/'
        + partnerId + '/');
}

AppEndpoints.plannedActionsIMOEdit = function(responsePlanId, partnerId, projectId) {
    return AppEndpoints._buildUrl('/partner/partner-project-details/partner/'
        + partnerId + '/' + projectId + '/');
}

AppEndpoints.plannedActionsProjectOverview = function(projectId) {
    return AppEndpoints._buildUrl('/partner/partner-project-details/' + projectId + '/');
}

AppEndpoints.plannedActionsActivityOverview = function(responsePlanId, activityId) {
    return AppEndpoints._buildUrl('/partner/' + responsePlanId
        + '/partner-activity/' + activityId + '/');
}

AppEndpoints.responseParametersClustersObjectiveDetail = function(objectiveId) {
    return AppEndpoints._buildUrl('/cluster/cluster-objective/' + objectiveId + '/');
}

AppEndpoints.responseParamtersClustersActivityDetail = function(activityId) {
    return AppEndpoints._buildUrl('/cluster/cluster-activity/' + activityId + '/');
}

AppEndpoints.clusterIndicatorReports = function (responsePlanId) {
    return AppEndpoints._buildUrl('/cluster/' + responsePlanId + '/cluster-indicator-reports/');
}

AppEndpoints.clusterIndicatorReport = function (responsePlanId, reportId) {
    return AppEndpoints.clusterIndicatorReports(responsePlanId) + reportId + '/';
}

AppEndpoints.clusterIndicatorReportsImportTemplate = function (responsePlanId) {
    return AppEndpoints.clusterIndicatorReports(responsePlanId) + 'export/';
}

AppEndpoints.clusterIndicatorReportsExport = function (responsePlanId) {
    return AppEndpoints.clusterIndicatorReports(responsePlanId) + 'export-for-analysis/';
}

AppEndpoints.clusterIndicatorReportsImport = function (responsePlanId) {
    return AppEndpoints.clusterIndicatorReports(responsePlanId) + 'import/';
}

AppEndpoints.clusterIndicatorNames = function (responsePlanId) {
    return AppEndpoints._buildUrl(
        '/cluster/' +
        responsePlanId +
        '/cluster-reportable-simple-list/'
    );
}

AppEndpoints.clusterNames = function (responsePlanId) {
    return AppEndpoints._buildUrl('/cluster/' + responsePlanId + '/cluster-simple-list/');
}

AppEndpoints.clusterProjectNames = function (responsePlanId) {
    return AppEndpoints._buildUrl('/partner/' + responsePlanId + '/partner-project-simple-list/');
}

AppEndpoints.clusterPartnerNames = function (responsePlanId) {
    return AppEndpoints._buildUrl('/partner/' + responsePlanId + '/partner-simple-list/');
}

AppEndpoints.clusterLocationNames = function (responsePlanId) {
    return AppEndpoints._buildUrl('/core/' + responsePlanId + '/location/');
}

AppEndpoints.clusterIndicators = function () {
    return AppEndpoints._buildUrl('/indicator/cluster-indicator/');
}

AppEndpoints.partnerActivity = function (responsePlanId, mode) {
    return AppEndpoints._buildUrl('/partner/' + responsePlanId + '/create-partner-activity/' + mode);
}

AppEndpoints.partnerActivityUpdate = function (responsePlanId, activityId) {
    return AppEndpoints._buildUrl(
        '/partner/' + responsePlanId + '/update-partner-activity/' + activityId + '/'
    );
}

AppEndpoints.partnersByClusterActivityId = function (clusterActivityId) {
    return AppEndpoints._buildUrl('/partner/cluster-activity/' + clusterActivityId + '/partners/');
}

AppEndpoints.partnerActivityList = function (responsePlanId) {
    return AppEndpoints._buildUrl('/partner/' + responsePlanId + '/partner-activity-list/');
}

AppEndpoints.reportExport = function (locationId, reportId) {
    return AppEndpoints._buildUrl('/unicef/' + locationId + '/progress-reports/' +
        reportId + '/annex-C-export-PDF/');
}

AppEndpoints.clusterDashboard = function (responsePlanId, mode) {
    return AppEndpoints._buildUrl(
        '/cluster/' +
        responsePlanId +
        '/' +
        mode +
        '-dashboard/'
    );
}

AppEndpoints.clusterIndicatorLocations = function (responsePlanId) {
    return AppEndpoints._buildUrl('/cluster/' + responsePlanId + '/cluster-indicators-locations/');
}

AppEndpoints.userSignOut = function () {
    return AppEndpoints._buildUrl('/account/user-logout/');
}

AppEndpoints.userLogin = function() {
    return AppEndpoints._buildUrl('/account/auth/get-token/');
}

AppEndpoints.userLoginToken = function() {
    return AppEndpoints._buildUrl('/account/auth/login-with-token/');
}

AppEndpoints.userProfile = function() {
    return AppEndpoints._buildUrl('/account/user-profile/');
}

AppEndpoints.progressReportAttachments = function (locationId, reportId) {
    return AppEndpoints.progressReports(locationId) + reportId + '/attachments/';
}

AppEndpoints.progressReportAttachmentDetail = function (locationId, reportId, attachmentId) {
    return AppEndpoints.progressReports(locationId) + reportId + '/attachments/' + attachmentId + '/';
}

AppEndpoints.analysisOperationalPresence = function (responsePlanId, type) {
    return AppEndpoints._buildUrl(
        '/cluster/cluster-analysis/' + responsePlanId + '/operational-presence/' + type
    );
}

AppEndpoints.analysisIndicators = function (responsePlanId) {
    return AppEndpoints._buildUrl('/cluster/cluster-analysis/' + responsePlanId + '/indicators/');
}

AppEndpoints.analysisIndicator = function (responsePlanId, indicatorId) {
    return AppEndpoints.analysisIndicators(responsePlanId) + indicatorId;
}

AppEndpoints.indicatorPerLocationVars = function (reportableId) {
    return AppEndpoints._buildUrl('/indicator/' + reportableId + '/baseline_in_need');
}

AppEndpoints.indicatorIMOMessage = function () {
    return AppEndpoints._buildUrl('/indicator/cluster-indicator-imo-message/');
}

AppEndpoints.ochaResponsePlans = function (workspaceId) {
    return AppEndpoints._buildUrl('/ocha/response-plans/workspace/' + workspaceId + '/');
}

AppEndpoints.ochaResponsePlanDetails = function (planId) {
    return AppEndpoints._buildUrl('/ocha/response-plans/' + planId + '/');
}

AppEndpoints.customResponsePlan = function (workspaceId) {
    return AppEndpoints._buildUrl('/core/workspace/' + workspaceId + '/response-plan/create/');
}

AppEndpoints.ochaProjectsList = function (responsePlanId) {
    return AppEndpoints._buildUrl('/ocha/projects/response-plan/' + responsePlanId + '/');
}

AppEndpoints.ochaProjectDetails = function (projectId) {
    return AppEndpoints._buildUrl('/ocha/projects/' + projectId + '/');
}

try {
    module.exports = exports = AppEndpoints;
} catch (e) {}