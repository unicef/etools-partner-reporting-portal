import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../redux/store';
import {
  programmeDocumentReportsAttachmentsPending,
  programmeDocumentReportsAttachmentsCurrent
} from '../../redux/selectors/programmeDocumentReportsAttachments';
import {pdReportsAttachmentsSet} from '../../redux/actions/pdReportsAttachments';
import {
  computegPDListUrl,
  computeListUrl,
  getDeletegPDUrl,
  getDeleteUrl,
  setFiles
} from './js/report-attachments-functions';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-file';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {RootState} from '../../typings/redux.types';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';

/**
 * @customElement
 * @appliesMixin UtilsMixin
 */
@customElement('report-attachments')
export class ReportAttachments extends UtilsMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
    *[hidden] {
      display: none !important;
    }
    #face-container,
    #other-one-container,
    #other-two-container,
    #other-three-container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
    }
    etools-file {
      padding-block-end: 8px;
    }
    sl-spinner {
      font-size: 1.5rem;
    }
  `;

  @property({type: Boolean})
  readonly!: boolean;

  @property({type: Object})
  faceAttachment!: any;

  @property({type: Object})
  otherOneAttachment!: any;

  @property({type: Object})
  otherTwoAttachment!: any;

  @property({type: Object})
  otherThreeAttachment!: any;

  @property({type: Boolean})
  faceLoading!: boolean;

  @property({type: Boolean})
  showFace = false;

  @property({type: Boolean})
  isGPD = false;

  @property({type: Boolean})
  otherOneLoading!: boolean;

  @property({type: Boolean})
  otherTwoLoading!: boolean;

  @property({type: Boolean})
  otherThreeLoading!: boolean;

  @property({type: Boolean})
  pending!: boolean;

  @property({type: Array})
  attachments!: any[];

  @property({type: String})
  attachmentsListUrl?: string;

  @property({type: String})
  attachmentDeleteUrl?: string;

  @property({type: String})
  locationId!: string;

  @property({type: String})
  reportId!: string;

  @state() mapKeyToLoading;

  connectedCallback(): void {
    super.connectedCallback();

    this.mapKeyToLoading = {
      faceAttachmentComponent: this.faceLoading,
      otherOneAttachmentComponent: this.otherOneLoading,
      otherTwoAttachmentComponent: this.otherTwoLoading,
      otherThreeAttachmentComponent: this.otherThreeLoading
    };
  }

  stateChanged(state: RootState) {
    if (this.pending !== this._programmeDocumentReportsAttachmentsPending(state)) {
      this.pending = this._programmeDocumentReportsAttachmentsPending(state);
    }
    if (this.attachments !== this._programmeDocumentReportsAttachmentsCurrent(state)) {
      this.attachments = this._programmeDocumentReportsAttachmentsCurrent(state);
    }
    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
    if (this.reportId !== state.programmeDocumentReports.current.id) {
      this.reportId = state.programmeDocumentReports.current.id;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('attachmentsListUrl')) {
      this._getReportAttachments();
    }

    if (changedProperties.has('attachments')) {
      this._setFiles();
    }

    if (changedProperties.has('locationId') || changedProperties.has('reportId')) {
      this.attachmentsListUrl = this._computeListUrl(this.locationId, this.reportId);
    }
  }

  render() {
    return html`
      ${this.showFace
        ? html`<div id="face-container">
            <etools-upload
              id="faceAttachmentComponent"
              label="${translate('FACE')}"
              .fileUrl="${this.faceAttachment?.path}"
              .uploadEndpoint="${this.getUploadUrl(this.attachmentsListUrl, this.faceAttachment?.id)}"
              @upload-started="${() => this._uploadStarted('faceAttachmentComponent')}"
              @upload-finished="${(e: CustomEvent) => this._uploadFinished(e, 'faceAttachmentComponent')}"
              @delete-file="${() => this._deleteFile('faceAttachmentComponent', this.faceAttachment?.id)}"
              .endpointInfo="${{
                rawFilePropertyName: 'path',
                extraInfo: {type: 'FACE'},
                rejectWithRequest: true,
                method: this.faceAttachment?.id ? 'PUT' : 'POST'
              }}"
              ?disabled="${this.pending}"
              ?readonly="${this.readonly}"
            >
            </etools-upload>
            <sl-spinner ?hidden="${!this.faceLoading}"></sl-spinner>
          </div>`
        : ''}

      <div id="other-one-container">
        <etools-upload
          id="otherOneAttachmentComponent"
          label="${translate('OTHER')} #1"
          .fileUrl="${this.otherOneAttachment?.path}"
          .uploadEndpoint="${this.getUploadUrl(this.attachmentsListUrl, this.otherOneAttachment?.id)}"
          @upload-started="${() => this._uploadStarted('otherOneAttachmentComponent')}"
          @upload-finished="${(e: CustomEvent) => this._uploadFinished(e, 'otherOneAttachmentComponent')}"
          @delete-file="${() => this._deleteFile('otherOneAttachmentComponent', this.otherOneAttachment?.id)}"
          .endpointInfo="${{
            rawFilePropertyName: 'path',
            extraInfo: {type: 'Other'},
            rejectWithRequest: true,
            method: this.otherOneAttachment?.id ? 'PUT' : 'POST'
          }}"
          ?disabled="${this.pending}"
          ?readonly="${this.readonly}"
        >
        </etools-upload>
        <sl-spinner ?hidden="${!this.otherOneLoading}"></sl-spinner>
      </div>

      <div id="other-two-container">
        <etools-upload
          id="otherTwoAttachmentComponent"
          label="${translate('OTHER')} #2"
          .fileUrl="${this.otherTwoAttachment?.path}"
          .uploadEndpoint="${this.getUploadUrl(this.attachmentsListUrl, this.otherTwoAttachment?.id)}"
          @upload-started="${() => this._uploadStarted('otherTwoAttachmentComponent')}"
          @upload-finished="${(e: CustomEvent) => this._uploadFinished(e, 'otherTwoAttachmentComponent')}"
          @delete-file="${() => this._deleteFile('otherTwoAttachmentComponent', this.otherTwoAttachment?.id)}"
          .endpointInfo="${{
            rawFilePropertyName: 'path',
            extraInfo: {type: 'Other'},
            rejectWithRequest: true,
            method: this.otherTwoAttachment?.id ? 'PUT' : 'POST'
          }}"
          ?disabled="${this.pending}"
          ?readonly="${this.readonly}"
        >
        </etools-upload>
        <sl-spinner ?hidden="${!this.otherTwoLoading}"></sl-spinner>
      </div>

      ${!this.showFace
        ? html` <div id="other-three-container">
            <etools-upload
              id="otherTwoAttachmentComponent"
              label="${translate('OTHER')} #3"
              .fileUrl="${this.otherThreeAttachment?.path}"
              .uploadEndpoint="${this.getUploadUrl(this.attachmentsListUrl, this.otherThreeAttachment?.id)}"
              @upload-started="${() => this._uploadStarted('otherThreeAttachmentComponent')}"
              @upload-finished="${(e: CustomEvent) => this._uploadFinished(e, 'otherThreeAttachmentComponent')}"
              @delete-file="${() => this._deleteFile('otherThreeAttachmentComponent', this.otherThreeAttachment?.id)}"
              .endpointInfo="${{
                rawFilePropertyName: 'path',
                extraInfo: {type: 'Other'},
                rejectWithRequest: true,
                method: this.otherThreeAttachment?.id ? 'PUT' : 'POST'
              }}"
              ?disabled="${this.pending}"
              ?readonly="${this.readonly}"
            >
            </etools-upload>
            <sl-spinner ?hidden="${!this.otherThreeLoading}"></sl-spinner>
          </div>`
        : ''}
    `;
  }

  _programmeDocumentReportsAttachmentsPending(rootState: RootState) {
    return programmeDocumentReportsAttachmentsPending(rootState);
  }

  _programmeDocumentReportsAttachmentsCurrent(rootState: RootState) {
    return programmeDocumentReportsAttachmentsCurrent(rootState);
  }

  _computeListUrl(locationId: string, reportId: string) {
    if (!locationId || !reportId) {
      return;
    }
    return this.isGPD ? computegPDListUrl(locationId, reportId) : computeListUrl(locationId, reportId);
  }

  _uploadStarted(type: string) {
    this.mapKeyToLoading[type] = true;
    this.pending = true;
    this.requestUpdate();
  }

  _uploadFinished(e: CustomEvent, type: string) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      switch (type) {
        case 'faceAttachmentComponent':
          this.faceAttachment = uploadResponse;
          break;
        case 'otherOneAttachmentComponent':
          this.otherOneAttachment = uploadResponse;
          break;
        case 'otherTwoAttachmentComponent':
          this.otherTwoAttachment = uploadResponse;
          break;
        case 'otherThreeAttachmentComponent':
          this.otherThreeAttachment = uploadResponse;
          break;
      }
    }
    this.pending = false;
    this.mapKeyToLoading[type] = false;
    this.requestUpdate();
  }

  getUploadUrl(attachmentsListUrl: string | undefined, id: any) {
    if (!attachmentsListUrl) return '';

    return id ? `${attachmentsListUrl}${id}/` : attachmentsListUrl;
  }

  _setFiles() {
    this.faceAttachment = undefined;
    this.otherOneAttachment = undefined;
    this.otherTwoAttachment = undefined;
    this.otherThreeAttachment = undefined;
    if (!this.attachments) {
      this.attachments = [];
    }
    this.showFace = this.attachments.find((attachment) => attachment.type === 'FACE') ? true : false;

    fireEvent(this, 'attachments-loaded', {hasFaceAttachment: this.showFace});

    setFiles(this.attachments).forEach((attachment: any) => {
      if (attachment.type === 'Other') {
        if (!this.otherOneAttachment || !Object.keys(this.otherOneAttachment).length) {
          this.otherOneAttachment = attachment;
        } else if (!this.otherTwoAttachment || !Object.keys(this.otherTwoAttachment).length) {
          this.otherTwoAttachment = attachment;
        } else if (!this.otherThreeAttachment || !Object.keys(this.otherThreeAttachment).length) {
          this.otherThreeAttachment = attachment;
        }
      } else if (attachment.type === 'FACE') {
        this.faceAttachment = attachment;
      }
    });
  }

  _getDeleteUrl(locationId: string, reportId: string, attachmentId: string) {
    return this.isGPD
      ? getDeletegPDUrl(locationId, reportId, attachmentId)
      : getDeleteUrl(locationId, reportId, attachmentId);
  }

  _deleteFile(type: string, id: string | undefined) {
    if (!type || !id) {
      return;
    }

    const attachmentDeleteUrl = this._getDeleteUrl(this.locationId, this.reportId, id);
    const isAlreadySaved = (this.attachments || []).some((x) => String(x.id) === String(id));
    sendRequest({
      method: 'DELETE',
      endpoint: {url: attachmentDeleteUrl}
    })
      .then((_res) => {
        if (isAlreadySaved) {
          store.dispatch(pdReportsAttachmentsSet(this.reportId, null, parseInt(id)));
        }

        fireEvent(this, 'toast', {text: getTranslation('FILE_DELETED')});

        switch (type) {
          case 'faceAttachmentComponent':
            this.faceAttachment = undefined;
            break;
          case 'otherOneAttachmentComponent':
            this.otherOneAttachment = undefined;
            break;
          case 'otherTwoAttachmentComponent':
            this.otherTwoAttachment = undefined;
            break;
          case 'otherThreeAttachmentComponent':
            this.otherThreeAttachment = undefined;
            break;
        }
        this.requestUpdate();
      })
      .catch((err) => {
        console.log(err);
        fireEvent(this, 'toast', {text: getTranslation('AN_ERROR_OCCURRED')});
      });
  }

  replaceCharsThatAreNotLetterDigitDotOrUnderline(files: any[]) {
    (files || []).forEach((file: any) => {
      if (/[^a-zA-Z0-9-_\\.]+/.test(file.file_name)) {
        file.file_name = file.file_name.replace(/[^a-zA-Z0-9-_\\.]+/g, '_');
      }
    });
  }

  _getReportAttachments() {
    if (!this.attachmentsListUrl) {
      return;
    }
    sendRequest({
      method: 'GET',
      endpoint: {url: this.attachmentsListUrl}
    }).then((data) => {
      store.dispatch(pdReportsAttachmentsSet(this.reportId, data));
    });
  }
}
