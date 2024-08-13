import Constants from '../../etools-prp-common/constants';

export const pdReportsAttachmentsLoadingStart = function (reportId: string) {
  return {
    type: Constants.PD_REPORT_ATTACHMENT_LOADING_START,
    reportId: reportId
  };
};

export const pdReportsAttachmentsLoadingStop = function (reportId: string) {
  return {
    type: Constants.PD_REPORT_ATTACHMENT_LOADING_STOP,
    reportId: reportId
  };
};

export const pdReportsAttachmentsSet = function (reportId: string, data: any, deletedAttachmentId?: number) {
  if (deletedAttachmentId) {
    return {
      type: Constants.SET_PD_REPORT_ATTACHMENT,
      reportId: reportId,
      data: {id: deletedAttachmentId, action: 'delete'}
    };
  } else {
    return {
      type: Constants.SET_PD_REPORT_ATTACHMENT,
      reportId: reportId,
      data: data
    };
  }
};

// use instead of App.Actions.PDReportsAttachments
export const pdReportsAttachmentsSync = function (attachmentsThunk: any, reportId: string) {
  return function (dispatch: any) {
    dispatch(pdReportsAttachmentsLoadingStart(reportId));

    return attachmentsThunk
      .then(function (res: any) {
        dispatch(pdReportsAttachmentsLoadingStop(reportId));
        dispatch(pdReportsAttachmentsSet(reportId, res, res));
      })
      .catch(function (err: any) {
        dispatch(pdReportsAttachmentsLoadingStop(reportId));

        return Promise.reject(err);
      });
  };
};
