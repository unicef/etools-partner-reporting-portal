import Endpoints from '../../../endpoints';

export function computeListUrl(locationId: string, reportId: string) {
  return Endpoints.progressReportAttachments(locationId, reportId);
}

export function computegPDListUrl(locationId: string, reportId: string) {
  return Endpoints.progressReportAttachments(locationId, reportId);
}

export function getDeleteUrl(locationId: string, reportId: string, attachmentId: string) {
  return Endpoints.progressReportAttachmentDetail(locationId, reportId, attachmentId);
}

export function getDeletegPDUrl(locationId: string, reportId: string, attachmentId: string) {
  return Endpoints.progressgPDReportAttachmentDetail(locationId, reportId, attachmentId);
}

export function setFiles(attachments: any[]) {
  return (attachments || []).filter((attachment) => attachment && attachment.path);
}
