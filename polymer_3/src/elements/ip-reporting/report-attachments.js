var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import { html } from '@polymer/polymer';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import NotificationsMixin from '../../etools-prp-common/mixins/notifications-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import '../../etools-prp-common/elements/etools-prp-ajax';
import '@polymer/polymer/lib/elements/dom-if';
import { programmeDocumentReportsAttachmentsPending, programmeDocumentReportsAttachmentsCurrent } from '../../redux/selectors/programmeDocumentReportsAttachments';
import { pdReportsAttachmentsSync } from '../../redux/actions/pdReportsAttachments';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { computeListUrl, getDeleteUrl, setFiles } from './js/report-attachments-functions';
import '@unicef-polymer/etools-file/etools-file';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin LocalizeMixin
 */
class ReportAttachments extends LocalizeMixin(NotificationsMixin(UtilsMixin(ReduxConnectedElement))) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }

        #face-container,
        #other-one-container,
        #other-two-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-direction: row;
        }
      </style>

      <etools-prp-ajax id="upload" method="post" loading="{{loading}}" url="[[attachmentsListUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="replace" method="put" url="[[attachmentDeleteUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="download" method="get" url="[[attachmentsListUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="delete" method="delete" url="[[attachmentDeleteUrl]]"> </etools-prp-ajax>

      <div id="face-container">
        <etools-file
          id="faceAttachmentComponent"
          files="{{faceAttachment}}"
          label="[[localize('face')]]"
          disabled="[[pending]]"
          readonly="[[readonly]]"
          use-delete-events
        >
        </etools-file>

        <template is="dom-if" if="{{faceLoading}}">
          <paper-spinner active></paper-spinner>
        </template>
      </div>

      <div id="other-one-container">
        <etools-file
          id="otherOneAttachmentComponent"
          files="{{otherOneAttachment}}"
          label="[[localize('other')]] #1"
          disabled="[[pending]]"
          readonly="[[readonly]]"
          use-delete-events
        >
        </etools-file>

        <template is="dom-if" if="{{otherOneLoading}}">
          <paper-spinner active></paper-spinner>
        </template>
      </div>

      <div id="other-two-container">
        <etools-file
          id="otherTwoAttachmentComponent"
          files="{{otherTwoAttachment}}"
          label="[[localize('other')]] #2"
          disabled="[[pending]]"
          readonly="[[readonly]]"
          use-delete-events
        >
        </etools-file>

        <template is="dom-if" if="{{otherTwoLoading}}">
          <paper-spinner active></paper-spinner>
        </template>
      </div>
    `;
    }
    static get observers() {
        return [
            '_filesChanged(faceAttachment.*)',
            '_filesChanged(otherOneAttachment.*)',
            '_filesChanged(otherTwoAttachment.*)'
        ];
    }
    _programmeDocumentReportsAttachmentsPending(rootState) {
        return programmeDocumentReportsAttachmentsPending(rootState);
    }
    _programmeDocumentReportsAttachmentsCurrent(rootState) {
        return programmeDocumentReportsAttachmentsCurrent(rootState);
    }
    _computeListUrl(locationId, reportId) {
        if (!locationId || !reportId) {
            return;
        }
        return computeListUrl(locationId, reportId);
    }
    _setFiles() {
        this.set('faceAttachment', []);
        this.set('otherOneAttachment', []);
        this.set('otherTwoAttachment', []);
        setFiles(this.attachments).forEach((attachment) => {
            if (attachment.type === 'Other' && this.get('otherOneAttachment').length === 1) {
                this.set('otherTwoAttachment', [attachment]);
            }
            else if (attachment.type === 'Other') {
                this.set('otherOneAttachment', [attachment]);
            }
            else {
                this.set('faceAttachment', [attachment]);
            }
        });
    }
    _getDeleteUrl(locationId, reportId, attachmentId) {
        return getDeleteUrl(locationId, reportId, attachmentId);
    }
    _onDeleteFile(e) {
        const deleteUrl = this._getDeleteUrl(this.locationId, this.reportId, e.detail.file.id);
        this.set('attachmentDeleteUrl', deleteUrl);
        e.stopPropagation();
        const deleteThunk = this.shadowRoot.querySelector('#delete').thunk();
        this.shadowRoot.querySelector('#delete').abort();
        // @ts-ignore
        return (this.reduxStore
            .dispatch(pdReportsAttachmentsSync(deleteThunk, this.reportId))
            // @ts-ignore
            .then(() => {
            this._notifyFileDeleted();
            this.set('attachmentDeleteUrl', undefined);
            if (this.get('faceAttachment').length !== 0 && e.detail.file.id === this.get('faceAttachment')[0].id) {
                this.$.faceAttachmentComponent.fileInput.value = null;
                this.$.faceAttachmentComponent.set('files', []);
            }
            else if (this.get('otherOneAttachment').length !== 0 &&
                e.detail.file.id === this.get('otherOneAttachment')[0].id) {
                this.$.otherOneAttachmentComponent.fileInput.value = null;
                this.$.otherOneAttachmentComponent.set('files', []);
            }
            else if (this.get('otherTwoAttachment').length !== 0 &&
                e.detail.file.id === this.get('otherTwoAttachment')[0].id) {
                this.$.otherTwoAttachmentComponent.fileInput.value = null;
                this.$.otherTwoAttachmentComponent.set('files', []);
            }
        })
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling
        }));
    }
    replaceCharsThatAreNotLetterDigitDotOrUnderline(files) {
        (files || []).forEach((file) => {
            if (/[^a-zA-Z0-9-_\\.]+/.test(file.file_name)) {
                file.file_name = file.file_name.replace(/[^a-zA-Z0-9-_\\.]+/g, '_');
            }
        });
    }
    _filesChanged(change) {
        let attachmentPropertyName = change.path.replace('.length', '');
        const isEmpty = change.value === 0 ? true : false;
        const attachment = isEmpty ? undefined : change.base[0];
        if (attachment === undefined) {
            return;
        }
        const files = isEmpty ? [] : change.base;
        this.replaceCharsThatAreNotLetterDigitDotOrUnderline(files);
        const attachmentType = attachmentPropertyName.toLowerCase().indexOf('face') !== -1 ? 'FACE' : 'Other';
        if (isEmpty || (!isEmpty && attachment.path !== null)) {
            return;
        }
        this.filesChanged = Debouncer.debounce(this.filesChanged, timeOut.after(100), () => {
            if (change.path.split('.').length < 2 || !files.length) {
                return;
            }
            const data = new FormData();
            let thunk;
            files.forEach((file) => {
                data.append('path', file.raw, file.file_name);
                data.append('type', attachmentType);
            });
            if (attachment.id === null) {
                thunk = this.shadowRoot.querySelector('#upload').thunk();
                const uplodCtrl = this.shadowRoot.querySelector('#upload');
                uplodCtrl.abort();
                uplodCtrl.body = data;
                if (attachmentPropertyName === 'faceAttachment') {
                    this.set('faceLoading', true);
                }
                else if (attachmentPropertyName === 'otherOneAttachment') {
                    this.set('otherOneLoading', true);
                }
                else if (attachmentPropertyName === 'otherTwoAttachment') {
                    this.set('otherTwoLoading', true);
                }
            }
            else {
                const replaceUrl = this._getDeleteUrl(this.locationId, this.reportId, attachment.id);
                this.set('attachmentDeleteUrl', replaceUrl);
                thunk = this.shadowRoot.querySelector('#replace').thunk();
                const replaceCtrl = this.shadowRoot.querySelector('#replace');
                replaceCtrl.abort();
                replaceCtrl.body = data;
                attachmentPropertyName = attachmentPropertyName.split('.')[0];
            }
            this.reduxStore
                .dispatch(pdReportsAttachmentsSync(thunk, this.reportId))
                // @ts-ignore
                .then(() => {
                this._notifyFileUploaded();
                this.set('faceLoading', false);
                this.set('otherOneLoading', false);
                this.set('otherTwoLoading', false);
                const attachments = this.get('attachments');
                attachments.forEach((item) => {
                    if (attachment.id !== null && item.id === attachment.id) {
                        this.set(attachmentPropertyName, [item]);
                        return;
                    }
                });
                if (attachment.id === null) {
                    const duplicates = attachments.filter((item) => {
                        const tokens = attachment.file_name.split('.');
                        if (tokens.length === 0) {
                            return item.file_name.indexOf(attachment.file_name) !== -1;
                        }
                        else {
                            return item.file_name.indexOf(tokens[0]) !== -1 && item.file_name.indexOf(tokens[1]) !== -1;
                        }
                    });
                    if (duplicates.length === 1) {
                        this.set(attachmentPropertyName, [duplicates[0]]);
                    }
                    else if (duplicates.length > 1) {
                        let correctedItem;
                        duplicates.forEach((item) => {
                            if (item.file_name !== attachment.file_name) {
                                correctedItem = item;
                                return;
                            }
                        });
                        if (correctedItem) {
                            this.set(attachmentPropertyName, [correctedItem]);
                        }
                    }
                }
                this.set('attachmentDeleteUrl', undefined);
            })
                .catch((_err) => {
                // TODO: error handling
            });
        });
    }
    _addEventListeners() {
        this._onDeleteFile = this._onDeleteFile.bind(this);
        this.addEventListener('delete-file', this._onDeleteFile);
    }
    _removeEventListeners() {
        this.removeEventListener('delete-file', this._onDeleteFile);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    _getReportAttachments() {
        if (!this.attachmentsListUrl) {
            return;
        }
        const downloadThunk = this.shadowRoot.querySelector('#download').thunk();
        this.shadowRoot.querySelector('#download').abort();
        this.reduxStore
            .dispatch(pdReportsAttachmentsSync(downloadThunk, this.reportId))
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
        [
            this.shadowRoot.querySelector('#download'),
            this.shadowRoot.querySelector('#upload'),
            this.shadowRoot.querySelector('#delete')
        ].forEach((req) => {
            req.abort();
        });
        if (this.filesChanged && this.filesChanged.isActive()) {
            this.filesChanged.cancel();
        }
    }
}
__decorate([
    property({ type: Boolean })
], ReportAttachments.prototype, "readonly", void 0);
__decorate([
    property({ type: Array })
], ReportAttachments.prototype, "faceAttachment", void 0);
__decorate([
    property({ type: Array })
], ReportAttachments.prototype, "otherOneAttachment", void 0);
__decorate([
    property({ type: Array })
], ReportAttachments.prototype, "otherTwoAttachment", void 0);
__decorate([
    property({ type: Boolean })
], ReportAttachments.prototype, "faceLoading", void 0);
__decorate([
    property({ type: Boolean })
], ReportAttachments.prototype, "otherOneLoading", void 0);
__decorate([
    property({ type: Boolean })
], ReportAttachments.prototype, "otherTwoLoading", void 0);
__decorate([
    property({ type: Boolean, computed: '_programmeDocumentReportsAttachmentsPending(rootState)' })
], ReportAttachments.prototype, "pending", void 0);
__decorate([
    property({ type: Array, computed: '_programmeDocumentReportsAttachmentsCurrent(rootState)', observer: '_setFiles' })
], ReportAttachments.prototype, "attachments", void 0);
__decorate([
    property({ type: String, computed: '_computeListUrl(locationId, reportId)', observer: '_getReportAttachments' })
], ReportAttachments.prototype, "attachmentsListUrl", void 0);
__decorate([
    property({ type: String })
], ReportAttachments.prototype, "attachmentDeleteUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], ReportAttachments.prototype, "locationId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)' })
], ReportAttachments.prototype, "reportId", void 0);
window.customElements.define('report-attachments', ReportAttachments);
