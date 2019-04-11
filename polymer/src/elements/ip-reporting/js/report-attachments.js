function ReportAttachmentsUtils() {
        
}

ReportAttachmentsUtils.computeListUrl = function(locationId, reportId) {
    return App.Endpoints.progressReportAttachments(locationId, reportId);
}

ReportAttachmentsUtils.getDeleteUrl = function(locationId, reportId, attachmentId) {
    return App.Endpoints.progressReportAttachmentDetail(locationId, reportId, attachmentId);
}

try {
    module.exports = exports = ReportAttachmentsUtils;
} catch (e) {}