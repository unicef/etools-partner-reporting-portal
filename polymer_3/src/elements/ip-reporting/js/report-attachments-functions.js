import Endpoints from '../../../endpoints';
export function computeListUrl(locationId, reportId) {
    return Endpoints.progressReportAttachments(locationId, reportId);
}
export function getDeleteUrl(locationId, reportId, attachmentId) {
    return Endpoints.progressReportAttachmentDetail(locationId, reportId, attachmentId);
}
export function setFiles(attachments) {
    return (attachments || []).filter((attachment) => attachment && attachment.path);
}
