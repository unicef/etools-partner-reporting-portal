import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {
  programmeDocumentReportsAttachmentsPending,
  programmeDocumentReportsAttachmentsCurrent
} from '../../redux/selectors/programmeDocumentReportsAttachments';
import {pdReportsAttachmentsSync, pdReportsAttachmentsSet} from '../../redux/actions/pdReportsAttachments';
import {computeListUrl, getDeleteUrl, setFiles} from './js/report-attachments-functions';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-file';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate, get as getTranslation} from 'lit-translate';
import {RootState} from '../../typings/redux.types';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import {sendRequest, upload} from '@unicef-polymer/etools-utils/dist/etools-ajax';
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

    if (changedProperties.has('faceAttachment')) {
      // this._filesChanged(this.faceAttachment, 'faceAttachment');
    }
    if (changedProperties.has('otherOneAttachment')) {
      // this._filesChanged(this.otherOneAttachment, 'otherOneAttachment');
    }
    if (changedProperties.has('otherTwoAttachment')) {
      // this._filesChanged(this.otherTwoAttachment, 'otherTwoAttachment');
    }
    if (changedProperties.has('otherThreeAttachment')) {
      // this._filesChanged(this.otherThreeAttachment, 'otherThreeAttachment');
    }

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
              .fileUrl="${this.faceAttachment?.file_name}"
              .uploadEndpoint="${this.getUploadUrl(this.attachmentsListUrl, this.faceAttachment?.id)}"
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
          .fileUrl="${this.otherOneAttachment?.file_name}"
          .uploadEndpoint="${this.getUploadUrl(this.attachmentsListUrl, this.otherOneAttachment?.id)}"
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
          .fileUrl="${this.otherTwoAttachment?.file_name}"
          .uploadEndpoint="${this.getUploadUrl(this.attachmentsListUrl, this.otherTwoAttachment?.id)}"
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
              .fileUrl="${this.otherThreeAttachment?.file_name}"
              .uploadEndpoint="${this.getUploadUrl(this.attachmentsListUrl, this.otherThreeAttachment?.id)}"
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
    return computeListUrl(locationId, reportId);
  }

  _uploadFinished(e: CustomEvent, type: string) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      switch (type) {
        case 'faceAttachmentComponent':
          this.faceAttachment.id = uploadResponse.id;
          break;
        case 'otherOneAttachmentComponent':
          this.otherOneAttachment.id = uploadResponse.id;
          break;
        case 'otherTwoAttachmentComponent':
          this.otherTwoAttachment.id = uploadResponse.id;
          break;
        case 'otherThreeAttachmentComponent':
          this.otherThreeAttachment.id = uploadResponse.id;
          break;
      }
    }
  }

  getUploadUrl(attachmentsListUrl: string | undefined, id: any) {
    if (attachmentsListUrl) return '';

    return id ? `${attachmentsListUrl}/${id}/` : attachmentsListUrl;
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
    return getDeleteUrl(locationId, reportId, attachmentId);
  }

  _deleteFile(type: string, id: string | undefined) {
    if (!type || !id) {
      return;
    }

    const attachmentDeleteUrl = this._getDeleteUrl(this.locationId, this.reportId, id);

    sendRequest({
      method: 'DELETE',
      endpoint: {url: attachmentDeleteUrl}
    })
      .then((_res) => {
        store.dispatch(pdReportsAttachmentsSet(this.reportId, null, parseInt(id))).then(() => {
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
        });
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

  _filesChanged(files: any[], type: string) {
    if (!files || !files.length) {
      return;
    }

    this.replaceCharsThatAreNotLetterDigitDotOrUnderline(files);
    const attachmentType = type.toLowerCase().indexOf('face') !== -1 ? 'FACE' : 'Other';
    const attachment = files[0];

    debounce(() => {
      const data = new FormData();
      let thunk;

      const config = {
        uploadEndpoint: this.attachmentsListUrl!,
        endpointInfo: {rawFilePropertyName: 'path', extraInfo: {type: attachmentType}}
      };
      files.forEach((file: any) => {
        // data.append('path', file.raw, file.file_name);
        // data.append('type', attachmentType);

        if (type === 'faceAttachment') {
          this.faceLoading = true;
        } else if (type === 'otherOneAttachment') {
          this.otherOneLoading = true;
        } else if (type === 'otherTwoAttachment') {
          this.otherTwoLoading = true;
        } else if (type === 'otherThreeAttachment') {
          this.otherThreeLoading = true;
        }

        upload(config, file.raw, file.file_name)
          .then((res: any) => {
            pdReportsAttachmentsSet(this.reportId, res);
          })
          .catch((err) => {
            console.log(err);
            this.faceLoading = false;
            this.otherOneLoading = false;
            this.otherTwoLoading = false;
            this.otherThreeLoading = false;
          });
      });

      if (attachment.id === null) {
        thunk = sendRequest({
          method: 'POST',
          endpoint: {url: this.attachmentsListUrl as string},
          body: data
        });

        if (type === 'faceAttachment') {
          this.faceLoading = true;
        } else if (type === 'otherOneAttachment') {
          this.otherOneLoading = true;
        } else if (type === 'otherTwoAttachment') {
          this.otherTwoLoading = true;
        } else if (type === 'otherThreeAttachment') {
          this.otherThreeLoading = true;
        }
      } else {
        this.attachmentDeleteUrl = this._getDeleteUrl(this.locationId, this.reportId, attachment.id);

        thunk = sendRequest({
          method: 'DELETE',
          endpoint: {url: this.attachmentDeleteUrl},
          body: data
        });
      }

      store
        .dispatch(pdReportsAttachmentsSync(thunk, this.reportId))
        // @ts-ignore
        .then(() => {
          fireEvent(this, 'toast', {
            text: getTranslation('FILE_UPLOADED'),
            showCloseBtn: true
          });
          this.faceLoading = false;
          this.otherOneLoading = false;
          this.otherTwoLoading = false;
          this.otherThreeLoading = false;

          const attachments = this.get('attachments');

          attachments.forEach((item: any) => {
            if (attachment.id !== null && item.id === attachment.id) {
              return;
            }
          });

          if (attachment.id === null) {
            const duplicates = attachments.filter((item: any) => {
              const tokens = attachment.file_name.split('.');
              if (tokens.length === 0) {
                return item.file_name.indexOf(attachment.file_name) !== -1;
              } else {
                return item.file_name.indexOf(tokens[0]) !== -1 && item.file_name.indexOf(tokens[1]) !== -1;
              }
            });

            if (duplicates.length === 1) {
              // @dci
            } else if (duplicates.length > 1) {
              let correctedItem;

              duplicates.forEach((item: any) => {
                if (item.file_name !== attachment.file_name) {
                  correctedItem = item;
                  return;
                }
              });

              if (correctedItem) {
                // @dci
              }
            }
          }

          this.attachmentDeleteUrl = undefined;
        })
        .catch((_err: any) => {
          // TODO: error handling
        });
    }, 100)();
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

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }
}
