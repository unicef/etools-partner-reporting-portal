import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {
  programmeDocumentReportsAttachmentsPending,
  programmeDocumentReportsAttachmentsCurrent
} from '../../redux/selectors/programmeDocumentReportsAttachments';
import {pdReportsAttachmentsSync} from '../../redux/actions/pdReportsAttachments';
import {computeListUrl, getDeleteUrl, setFiles} from './js/report-attachments-functions';
import '@unicef-polymer/etools-file/etools-file';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {RootState} from '../../typings/redux.types';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
@customElement('report-attachments')
export class ReportAttachments extends UtilsMixin(LocalizeMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
    }
    #face-container,
    #other-one-container,
    #other-two-container,
    #other-three-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
    }
  `;

  @property({type: Boolean})
  readonly!: boolean;

  @property({type: Array})
  faceAttachment!: any[];

  @property({type: Array})
  otherOneAttachment!: any[];

  @property({type: Array})
  otherTwoAttachment!: any[];

  @property({type: Array})
  otherThreeAttachment!: any[];

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

  stateChanged(state: RootState){
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
    if (
      changedProperties.has('faceAttachment') ||
      changedProperties.has('otherOneAttachment') ||
      changedProperties.has('otherTwoAttachment') ||
      changedProperties.has('otherThreeAttachment')
    ) {
      this._filesChanged(changedProperties);
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
      <etools-prp-ajax
        id="upload"
        method="post"
        .loading=${this.pending}
        .url=${this.attachmentsListUrl}
      ></etools-prp-ajax>
      <etools-prp-ajax id="replace" method="put" .url=${this.attachmentDeleteUrl}></etools-prp-ajax>
      <etools-prp-ajax id="download" method="get" .url=${this.attachmentsListUrl}></etools-prp-ajax>
      <etools-prp-ajax id="delete" method="delete" .url=${this.attachmentDeleteUrl}></etools-prp-ajax>

      ${this.showFace
        ? html` <div id="face-container">
            <etools-file
              id="faceAttachmentComponent"
              .files=${this.faceAttachment}
              label="${this.localize('face')}"
              ?disabled=${this.pending}
              ?readonly=${this.readonly}
              use-delete-events
            ></etools-file>
            ${this.faceLoading ? html`<paper-spinner active></paper-spinner>` : html``}
          </div>`
        : ''}

      <div id="other-one-container">
        <etools-file
          id="otherOneAttachmentComponent"
          .files=${this.otherOneAttachment}
          label="${this.localize('other')} #1"
          ?disabled=${this.pending}
          ?readonly=${this.readonly}
          use-delete-events
        ></etools-file>
        ${this.otherOneLoading ? html`<paper-spinner active></paper-spinner>` : html``}
      </div>

      <div id="other-two-container">
        <etools-file
          id="otherTwoAttachmentComponent"
          .files=${this.otherTwoAttachment}
          label="${this.localize('other')} #2"
          ?disabled=${this.pending}
          ?readonly=${this.readonly}
          use-delete-events
        ></etools-file>
        ${this.otherTwoLoading ? html`<paper-spinner active></paper-spinner>` : html``}
      </div>

      ${!this.showFace
        ? html` <div id="other-three-container">
            <etools-file
              id="otherThreeAttachmentComponent"
              .files=${this.otherThreeAttachment}
              label="${this.localize('other')} #3"
              ?disabled=${this.pending}
              ?readonly=${this.readonly}
              use-delete-events
            ></etools-file>
            ${this.otherThreeLoading ? html`<paper-spinner active></paper-spinner>` : html``}
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

  _setFiles() {
    this.faceAttachment = [];
    this.otherOneAttachment = [];
    this.otherTwoAttachment = [];
    this.otherThreeAttachment = [];
    if (!this.attachments) {
      this.attachments = [];
    }
    this.showFace = this.attachments.find((attachment) => attachment.type === 'FACE') ? true : false;

    fireEvent(this, 'attachments-loaded', {hasFaceAttachment: this.showFace});

    setFiles(this.attachments).forEach((attachment: any) => {
      if (attachment.type === 'Other') {
        if (!this.get('otherOneAttachment').length) {
          this.otherOneAttachment = [attachment];
        } else if (!this.get('otherTwoAttachment').length) {
          this.otherTwoAttachment = [attachment];
        } else if (!this.get('otherThreeAttachment').length) {
          this.otherThreeAttachment = [attachment];
        }
      } else if (attachment.type === 'FACE') {
        this.faceAttachment = [attachment];
      }
    });
  }

  _getDeleteUrl(locationId: string, reportId: string, attachmentId: string) {
    return getDeleteUrl(locationId, reportId, attachmentId);
  }

  _onDeleteFile(e: CustomEvent) {
    this.attachmentDeleteUrl = this._getDeleteUrl(this.locationId, this.reportId, e.detail.file.id);

    e.stopPropagation();

    const deleteThunk = (this.shadowRoot!.querySelector('#delete') as any as EtoolsPrpAjaxEl).thunk();

    (this.shadowRoot!.querySelector('#delete') as any as EtoolsPrpAjaxEl).abort();

    // @ts-ignore
    return (
      store
        .dispatch(pdReportsAttachmentsSync(deleteThunk, this.reportId))
        // @ts-ignore
        .then(() => {
          fireEvent(this, 'toast', {
            text: this.localize('file_deleted'),
            showCloseBtn: true
          });

          this.attachmentDeleteUrl = undefined;

          if (this.get('faceAttachment').length !== 0 && e.detail.file.id === this.get('faceAttachment')[0].id) {
            (this.shadowRoot!.getElementById('faceAttachmentComponent') as any).fileInput.value = null;
            (this.shadowRoot!.getElementById('faceAttachmentComponent') as any).files = [];
          } else if (
            this.get('otherOneAttachment').length !== 0 &&
            e.detail.file.id === this.get('otherOneAttachment')[0].id
          ) {
            (this.shadowRoot!.getElementById('otherOneAttachmentComponent') as any).fileInput.value = null;
            (this.shadowRoot!.getElementById('otherOneAttachmentComponent') as any).files = [];
          } else if (
            this.get('otherTwoAttachment').length !== 0 &&
            e.detail.file.id === this.get('otherTwoAttachment')[0].id
          ) {
            (this.shadowRoot!.getElementById('otherTwoAttachmentComponent') as any).fileInput.value = null;
            (this.shadowRoot!.getElementById('otherTwoAttachmentComponent') as any).files = [];
          } else if (
            this.get('otherThreeAttachment').length !== 0 &&
            e.detail.file.id === this.get('otherThreeAttachment')[0].id
          ) {
            (this.shadowRoot!.getElementById('otherThreeAttachmentComponent') as any).fileInput.value = null;
            (this.shadowRoot!.getElementById('otherThreeAttachmentComponent') as any).files = [];
          }
        })
        // @ts-ignore
        .catch((_err) => {
          // TODO: error handling
        })
    );
  }

  replaceCharsThatAreNotLetterDigitDotOrUnderline(files: any[]) {
    (files || []).forEach((file: any) => {
      if (/[^a-zA-Z0-9-_\\.]+/.test(file.file_name)) {
        file.file_name = file.file_name.replace(/[^a-zA-Z0-9-_\\.]+/g, '_');
      }
    });
  }

  _filesChanged(change: any) {
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

    debounce(() => {
      if (change.path.split('.').length < 2 || !files.length) {
        return;
      }

      const data = new FormData();
      let thunk;

      files.forEach((file: any) => {
        data.append('path', file.raw, file.file_name);
        data.append('type', attachmentType);
      });

      if (attachment.id === null) {
        thunk = (this.shadowRoot!.querySelector('#upload') as any as EtoolsPrpAjaxEl).thunk();
        const uplodCtrl = this.shadowRoot!.querySelector('#upload') as any as EtoolsPrpAjaxEl;
        uplodCtrl.abort();
        uplodCtrl.body = data;

        if (attachmentPropertyName === 'faceAttachment') {
          this.faceLoading = true;
        } else if (attachmentPropertyName === 'otherOneAttachment') {
          this.otherOneLoading = true;
        } else if (attachmentPropertyName === 'otherTwoAttachment') {
          this.otherTwoLoading = true;
        } else if (attachmentPropertyName === 'otherThreeAttachment') {
          this.otherThreeLoading = true;
        }
      } else {
        this.attachmentDeleteUrl = this._getDeleteUrl(this.locationId, this.reportId, attachment.id);

        thunk = (this.shadowRoot!.querySelector('#replace') as any as EtoolsPrpAjaxEl).thunk();
        const replaceCtrl = this.shadowRoot!.querySelector('#replace') as any as EtoolsPrpAjaxEl;
        replaceCtrl.abort();
        replaceCtrl.body = data;

        attachmentPropertyName = attachmentPropertyName.split('.')[0];
      }

      store
        .dispatch(pdReportsAttachmentsSync(thunk, this.reportId))
        // @ts-ignore
        .then(() => {
          fireEvent(this, 'toast', {
            text: this.localize('file_uploaded'),
            showCloseBtn: true
          });
          this.faceLoading = false;
          this.otherOneLoading = false;
          this.otherTwoLoading = false;
          this.otherThreeLoading = false;

          const attachments = this.get('attachments');

          attachments.forEach((item: any) => {
            if (attachment.id !== null && item.id === attachment.id) {
              this.set(attachmentPropertyName, [item]);
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
              this.set(attachmentPropertyName, [duplicates[0]]);
            } else if (duplicates.length > 1) {
              let correctedItem;

              duplicates.forEach((item: any) => {
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

          this.attachmentDeleteUrl = undefined;
        })
        .catch((_err: any) => {
          // TODO: error handling
        });
    }, 100);
  }

  _addEventListeners() {
    this._onDeleteFile = this._onDeleteFile.bind(this);
    this.addEventListener('delete-file', this._onDeleteFile as any);
  }

  _removeEventListeners() {
    this.removeEventListener('delete-file', this._onDeleteFile as any);
  }

  connectedCallback() {
    super.connectedCallback();

    this._addEventListeners();
  }

  _getReportAttachments() {
    if (!this.attachmentsListUrl) {
      return;
    }
    const downloadThunk = (this.shadowRoot!.querySelector('#download') as any as EtoolsPrpAjaxEl).thunk();
    (this.shadowRoot!.querySelector('#download') as any as EtoolsPrpAjaxEl).abort();
    store
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
      this.shadowRoot!.querySelector('#download') as any as EtoolsPrpAjaxEl,
      this.shadowRoot!.querySelector('#upload') as any as EtoolsPrpAjaxEl,
      this.shadowRoot!.querySelector('#delete') as any as EtoolsPrpAjaxEl
    ].forEach((req: EtoolsPrpAjaxEl) => {
      req.abort();
    });
  }
}
