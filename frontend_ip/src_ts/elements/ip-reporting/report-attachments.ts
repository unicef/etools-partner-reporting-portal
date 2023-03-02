import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import {html} from '@polymer/polymer';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import '../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import '@polymer/polymer/lib/elements/dom-if';
import {
  programmeDocumentReportsAttachmentsPending,
  programmeDocumentReportsAttachmentsCurrent
} from '../../redux/selectors/programmeDocumentReportsAttachments';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import {pdReportsAttachmentsSync} from '../../redux/actions/pdReportsAttachments';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {computeListUrl, getDeleteUrl, setFiles} from './js/report-attachments-functions';
import '@unicef-polymer/etools-file/etools-file';
// import {EtoolsFile} from '@unicef-polymer/etools-file/etools-file';
import {RootState} from '../../typings/redux.types';
import {fireEvent} from '../../etools-prp-common/utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ReportAttachments extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      <style>
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
      </style>

      <etools-prp-ajax id="upload" method="post" loading="{{loading}}" url="[[attachmentsListUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="replace" method="put" url="[[attachmentDeleteUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="download" method="get" url="[[attachmentsListUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="delete" method="delete" url="[[attachmentDeleteUrl]]"> </etools-prp-ajax>

      <template is="dom-if" if="[[showFace]]">
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
      </template>

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

      <template is="dom-if" if="[[!showFace]]">
        <div id="other-three-container">
          <etools-file
            id="otherThreeAttachmentComponent"
            files="{{otherThreeAttachment}}"
            label="[[localize('other')]] #3"
            disabled="[[pending]]"
            readonly="[[readonly]]"
            use-delete-events
          >
          </etools-file>

          <template is="dom-if" if="{{otherThreeLoading}}">
            <paper-spinner active></paper-spinner>
          </template>
        </div>
      </template>
    `;
  }

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

  @property({type: Boolean, computed: '_programmeDocumentReportsAttachmentsPending(rootState)'})
  pending!: boolean;

  @property({type: Array, computed: '_programmeDocumentReportsAttachmentsCurrent(rootState)', observer: '_setFiles'})
  attachments!: GenericObject[];

  @property({type: String, computed: '_computeListUrl(locationId, reportId)', observer: '_getReportAttachments'})
  attachmentsListUrl!: string;

  @property({type: String})
  attachmentDeleteUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  reportId!: string;

  filesChanged!: Debouncer | null;

  static get observers() {
    return [
      '_filesChanged(faceAttachment.*)',
      '_filesChanged(otherOneAttachment.*)',
      '_filesChanged(otherTwoAttachment.*)',
      '_filesChanged(otherThreeAttachment.*)'
    ];
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
    this.set('faceAttachment', []);
    this.set('otherOneAttachment', []);
    this.set('otherTwoAttachment', []);
    this.set('otherThreeAttachment', []);
    if (!this.attachments) {
      this.attachments = [];
    }
    this.set('showFace', this.attachments.find((attachment) => attachment.type === 'FACE') ? true : false);

    this.dispatchEvent(
      new CustomEvent('attachments-loaded', {
        detail: {hasFaceAttachment: this.showFace},
        bubbles: true,
        composed: true
      })
    );

    setFiles(this.attachments).forEach((attachment: GenericObject) => {
      if (attachment.type === 'Other') {
        if (!this.get('otherOneAttachment').length) {
          this.set('otherOneAttachment', [attachment]);
        } else if (!this.get('otherTwoAttachment').length) {
          this.set('otherTwoAttachment', [attachment]);
        } else if (!this.get('otherThreeAttachment').length) {
          this.set('otherThreeAttachment', [attachment]);
        }
      } else if (attachment.type === 'FACE') {
        this.set('faceAttachment', [attachment]);
      }
    });
  }

  _getDeleteUrl(locationId: string, reportId: string, attachmentId: string) {
    return getDeleteUrl(locationId, reportId, attachmentId);
  }

  _onDeleteFile(e: CustomEvent) {
    const deleteUrl = this._getDeleteUrl(this.locationId, this.reportId, e.detail.file.id);

    this.set('attachmentDeleteUrl', deleteUrl);

    e.stopPropagation();

    const deleteThunk = (this.shadowRoot!.querySelector('#delete') as EtoolsPrpAjaxEl).thunk();

    (this.shadowRoot!.querySelector('#delete') as EtoolsPrpAjaxEl).abort();

    // @ts-ignore
    return (
      this.reduxStore
        .dispatch(pdReportsAttachmentsSync(deleteThunk, this.reportId))
        // @ts-ignore
        .then(() => {
          fireEvent(this, 'toast', {
            text: this.localize('file_deleted'),
            showCloseBtn: true
          });

          this.set('attachmentDeleteUrl', undefined);

          if (this.get('faceAttachment').length !== 0 && e.detail.file.id === this.get('faceAttachment')[0].id) {
            (this.$.faceAttachmentComponent as any).fileInput.value = null;
            (this.$.faceAttachmentComponent as any).set('files', []);
          } else if (
            this.get('otherOneAttachment').length !== 0 &&
            e.detail.file.id === this.get('otherOneAttachment')[0].id
          ) {
            (this.$.otherOneAttachmentComponent as any).fileInput.value = null;
            (this.$.otherOneAttachmentComponent as any).set('files', []);
          } else if (
            this.get('otherTwoAttachment').length !== 0 &&
            e.detail.file.id === this.get('otherTwoAttachment')[0].id
          ) {
            (this.$.otherTwoAttachmentComponent as any).fileInput.value = null;
            (this.$.otherTwoAttachmentComponent as any).set('files', []);
          } else if (
            this.get('otherThreeAttachment').length !== 0 &&
            e.detail.file.id === this.get('otherThreeAttachment')[0].id
          ) {
            (this.$.otherThreeAttachmentComponent as any).fileInput.value = null;
            (this.$.otherThreeAttachmentComponent as any).set('files', []);
          }
        })
        // @ts-ignore
        .catch((_err) => {
          // TODO: error handling
        })
    );
  }

  replaceCharsThatAreNotLetterDigitDotOrUnderline(files: GenericObject[]) {
    (files || []).forEach((file: GenericObject) => {
      if (/[^a-zA-Z0-9-_\\.]+/.test(file.file_name)) {
        file.file_name = file.file_name.replace(/[^a-zA-Z0-9-_\\.]+/g, '_');
      }
    });
  }

  _filesChanged(change: GenericObject) {
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

      files.forEach((file: GenericObject) => {
        data.append('path', file.raw, file.file_name);
        data.append('type', attachmentType);
      });

      if (attachment.id === null) {
        thunk = (this.shadowRoot!.querySelector('#upload') as EtoolsPrpAjaxEl).thunk();
        const uplodCtrl = this.shadowRoot!.querySelector('#upload') as EtoolsPrpAjaxEl;
        uplodCtrl.abort();
        uplodCtrl.body = data;

        if (attachmentPropertyName === 'faceAttachment') {
          this.set('faceLoading', true);
        } else if (attachmentPropertyName === 'otherOneAttachment') {
          this.set('otherOneLoading', true);
        } else if (attachmentPropertyName === 'otherTwoAttachment') {
          this.set('otherTwoLoading', true);
        } else if (attachmentPropertyName === 'otherThreeAttachment') {
          this.set('otherThreeLoading', true);
        }
      } else {
        const replaceUrl = this._getDeleteUrl(this.locationId, this.reportId, attachment.id);
        this.set('attachmentDeleteUrl', replaceUrl);

        thunk = (this.shadowRoot!.querySelector('#replace') as EtoolsPrpAjaxEl).thunk();
        const replaceCtrl = this.shadowRoot!.querySelector('#replace') as EtoolsPrpAjaxEl;
        replaceCtrl.abort();
        replaceCtrl.body = data;

        attachmentPropertyName = attachmentPropertyName.split('.')[0];
      }

      this.reduxStore
        .dispatch(pdReportsAttachmentsSync(thunk, this.reportId))
        // @ts-ignore
        .then(() => {
          fireEvent(this, 'toast', {
            text: this.localize('file_uploaded'),
            showCloseBtn: true
          });
          this.set('faceLoading', false);
          this.set('otherOneLoading', false);
          this.set('otherTwoLoading', false);
          this.set('otherThreeLoading', false);

          const attachments = this.get('attachments');

          attachments.forEach((item: GenericObject) => {
            if (attachment.id !== null && item.id === attachment.id) {
              this.set(attachmentPropertyName, [item]);
              return;
            }
          });

          if (attachment.id === null) {
            const duplicates = attachments.filter((item: GenericObject) => {
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

              duplicates.forEach((item: GenericObject) => {
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
        .catch((_err: GenericObject) => {
          // TODO: error handling
        });
    });
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
    const downloadThunk = (this.shadowRoot!.querySelector('#download') as EtoolsPrpAjaxEl).thunk();
    (this.shadowRoot!.querySelector('#download') as EtoolsPrpAjaxEl).abort();
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
      this.shadowRoot!.querySelector('#download') as EtoolsPrpAjaxEl,
      this.shadowRoot!.querySelector('#upload') as EtoolsPrpAjaxEl,
      this.shadowRoot!.querySelector('#delete') as EtoolsPrpAjaxEl
    ].forEach((req: EtoolsPrpAjaxEl) => {
      req.abort();
    });

    if (this.filesChanged && this.filesChanged.isActive()) {
      this.filesChanged.cancel();
    }
  }
}

window.customElements.define('report-attachments', ReportAttachments);
