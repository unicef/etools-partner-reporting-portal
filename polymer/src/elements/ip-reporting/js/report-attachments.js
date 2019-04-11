function ReportAttachmentsUtils() {
        
}

ReportAttachmentsUtils.computeListUrl = function(locationId, reportId) {
    return App.Endpoints.progressReportAttachments(locationId, reportId);
}


try {
    module.exports = exports = ReportAttachmentsUtils;
} catch (e) {}