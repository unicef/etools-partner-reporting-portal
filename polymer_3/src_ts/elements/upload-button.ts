import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button';
import '@polymer/polymer/lib/elements/dom-if';
import 'etools-file/etools-file.js';
import UtilsMixin from '../mixins/utils-mixin';
import ModalMixin from '../mixins/modal-mixin';
import NotificationsMixin from '../mixins/notifications-mixin';
import './etools-prp-ajax';
import {EtoolsPrpAjaxEl} from './etools-prp-ajax';
import './error-box';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {buttonsStyles} from '../styles/buttons-styles';
import {modalStyles} from '../styles/modal-styles';
import {fireEvent} from '../utils/fire-custom-event';
import {GenericObject} from '../typings/globals.types';
import {PaperDialogElement} from '@polymer/paper-dialog/paper-dialog';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 */
class UploadButton extends ModalMixin(UtilsMixin(NotificationsMixin(ReduxConnectedElement))) {
  public static get template() {
    return html`
      ${buttonsStyles} ${modalStyles}
      <style include="iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          --etools-file-main-btn-color: var(--theme-primary-color);

          --paper-dialog: {
            width: 400px;
            margin: 0;
            }
        }

        .row {
          margin: 16px 0;
        }
      </style>

      <etools-prp-ajax
          id="upload"
          method="post"
          url="[[url]]"
          body="[[payload]]">
      </etools-prp-ajax>

      <paper-button
          class="btn-primary"
          on-tap="_openModal">
        <iron-icon icon="icons:file-upload"></iron-icon>
        <slot></slot>
      </paper-button>

      <paper-dialog
        id="dialog"
        with-backdrop
        opened="{{opened}}">

        <div class="header layout horizontal justified">
          <h2>
            <slot>[[modalTitle]]</slot>
          </h2>

          <paper-icon-button
            class="self-center"
            on-tap="close"
            icon="icons:close">
          </paper-icon-button>
        </div>

        <paper-dialog-scrollable>
          <template
              is="dom-if"
              if="[[opened]]"
              restamp="true">
            <error-box errors="[[errors]]"></error-box>

            <div class="row">
              <etools-file
                  files="{{files}}"
                  label="Template file"
                  disabled="[[pending]]"
                  accept=".xlsx, .xls"
                  required>
              </etools-file>
            </div>
          </template>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button
              on-tap="_save"
              class="btn-primary"
              raised>
            Save
          </paper-button>

          <paper-button
              on-tap="close">
            Cancel
          </paper-button>
        </div>

        <etools-loading active="[[pending]]"></etools-loading>
      </paper-dialog>


    `;
  }

  @property({type: String})
  url!: string;

  @property({type: Array})
  files!: any[];

  @property({type: Boolean})
  pending!: boolean;

  @property({type: String})
  modalTitle!: string;

  static get observers() {
    return ['_setDefaults(opened)'];
  }

  _openModal() {
    (this.shadowRoot!.querySelector('#dialog') as PaperDialogElement).open();
  }

  _save() {
    let file = this.get('files.0');
    let self = this;
    let data;

    if (!file) {
      return;
    }

    data = new FormData();
    data.append('file', file.raw, file.file_name);

    const upload = this.shadowRoot!.querySelector('#upload') as EtoolsPrpAjaxEl;
    upload!.body = data;

    this.set('pending', true);

    upload!.thunk()()
      .then(() => {
        self.set('pending', false);
        self.close();
        self._notifyFileUploaded();
        fireEvent(this, 'file-uploaded');
      })
      .catch(function(res: any) {
        self.set('pending', false);
        self.set('errors', res.data);
      });
  }

  _setDefaults(opened: boolean) {
    if (!opened) {
      return;
    }

    this.set('files', []);
    this.set('errors', {});
    this.set('pending', false);
  }

}

window.customElements.define('upload-button', UploadButton);
