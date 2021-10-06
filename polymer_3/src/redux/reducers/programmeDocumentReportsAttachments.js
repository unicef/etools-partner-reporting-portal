import { combineReducers } from 'redux';
import Constants from '../../etools-prp-common/constants';
export class ProgrammeDocumentReportsAttachmentsState {
    constructor() {
        this.byReport = {};
        this.pendingByReport = {};
    }
}
export const ProgrammeDocumentReportsAttachments = combineReducers({
    byReport: attachmentByReportReducer,
    pendingByReport: attachmentPendingByReportReducer
});
function updateForReport(state, reportId, newValue) {
    const change = {};
    let isNew = true;
    if (newValue instanceof Array === true || newValue instanceof Boolean === true) {
        change[reportId] = newValue;
    }
    else if (newValue instanceof Object === true) {
        if (newValue.action !== undefined && newValue.action === 'delete') {
            const newAttachments = state[reportId].filter(function (attachment) {
                return attachment.id !== newValue.id;
            });
            change[reportId] = newAttachments;
        }
        else {
            state[reportId].forEach(function (attachment, idx) {
                if (newValue.id === attachment.id) {
                    state[reportId][idx] = newValue;
                    isNew = false;
                    return;
                }
            });
            if (isNew === true) {
                state[reportId].push(newValue);
            }
        }
    }
    return Object.assign({}, state, change);
}
function attachmentByReportReducer(state = {}, action) {
    switch (action.type) {
        case Constants.SET_PD_REPORT_ATTACHMENT:
            return updateForReport(state, action.reportId, action.data);
        default:
            return state;
    }
}
function attachmentPendingByReportReducer(state = {}, action) {
    switch (action.type) {
        case Constants.PD_REPORT_ATTACHMENT_LOADING_START:
            return updateForReport(state, action.reportId, true);
        case Constants.PD_REPORT_ATTACHMENT_LOADING_STOP:
            return updateForReport(state, action.reportId, false);
        default:
            return state;
    }
}
