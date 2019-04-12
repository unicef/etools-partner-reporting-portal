function ReportAttachmentsUtils() {
        
}

ReportAttachmentsUtils.computeListUrl = function(locationId, reportId) {
    return App.Endpoints.progressReportAttachments(locationId, reportId);
}

ReportAttachmentsUtils.getDeleteUrl = function(locationId, reportId, attachmentId) {
    return App.Endpoints.progressReportAttachmentDetail(locationId, reportId, attachmentId);
}

ReportAttachmentsUtils.setFiles = function(attachments) {
    return attachments.map(function(attachment) {
        if (attachment && !attachment.path) {
            return;
        }
        return attachment;
    });
}

try {
    module.exports = exports = ReportAttachmentsUtils;
} catch (e) {}