import Constants from '../../etools-prp-common/constants';
export const pdReportsAttachmentsLoadingStart = function (reportId) {
    return {
        type: Constants.PD_REPORT_ATTACHMENT_LOADING_START,
        reportId: reportId
    };
};
export const pdReportsAttachmentsLoadingStop = function (reportId) {
    return {
        type: Constants.PD_REPORT_ATTACHMENT_LOADING_STOP,
        reportId: reportId
    };
};
export const pdReportsAttachmentsSet = function (reportId, data, res) {
    if (res.status === 204) {
        const resUrl = res.xhr.responseURL.split('/');
        const deletedAttachmentId = resUrl[resUrl.length - 2];
        return {
            type: Constants.SET_PD_REPORT_ATTACHMENT,
            reportId: reportId,
            data: { id: parseInt(deletedAttachmentId, 10), action: 'delete' }
        };
    }
    else {
        return {
            type: Constants.SET_PD_REPORT_ATTACHMENT,
            reportId: reportId,
            data: data
        };
    }
};
// use instead of App.Actions.PDReportsAttachments
export const pdReportsAttachmentsSync = function (attachmentsThunk, reportId) {
    return function (dispatch) {
        dispatch(pdReportsAttachmentsLoadingStart(reportId));
        return attachmentsThunk()
            .then(function (res) {
            dispatch(pdReportsAttachmentsLoadingStop(reportId));
            dispatch(pdReportsAttachmentsSet(reportId, res.data, res));
        })
            .catch(function (err) {
            dispatch(pdReportsAttachmentsLoadingStop(reportId));
            return Promise.reject(err);
        });
    };
};
