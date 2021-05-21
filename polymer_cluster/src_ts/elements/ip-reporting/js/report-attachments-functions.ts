import Endpoints from '../../../etools-prp-common/endpoints';

export function computeListUrl(locationId: string, reportId: string) {
  return Endpoints.progressReportAttachments(locationId, reportId);
}

export function getDeleteUrl(locationId: string, reportId: string, attachmentId: string) {
  return Endpoints.progressReportAttachmentDetail(locationId, reportId, attachmentId);
}

export function setFiles(attachments: any[]) {
  return (attachments || []).filter((attachment) => attachment && attachment.path);
}
