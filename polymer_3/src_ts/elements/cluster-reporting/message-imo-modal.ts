import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-input/paper-textarea';
import Endpoints from '../../endpoints';
import ModalMixin from '../../mixins/modal-mixin';
import UtilsMixin from '../../mixins/utils-mixin';
import '../../elements/etools-prp-ajax';
import {buttonsStyles} from '../../styles/buttons-styles';
import {modalStyles} from '../../styles/modal-styles';
import '../error-box';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import {fireEvent} from '../../utils/fire-custom-event';


/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 */
class MessageImoModal extends ModalMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      ${buttonsStyles} ${modalStyles}
      <style include="iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;

          --paper-dialog: {
            width: 600px;
            margin: 0;
            }

        }

        .row {
          margin: 16px 0;
        }

        .sender-note {
          color: var(--theme-primary-text-color-medium);
        }
      </style>

      <etools-prp-ajax
          id="message"
          url="[[messageUrl]]"
          method="post"
          body="[[data]]"
          content-type="application/json">
      </etools-prp-ajax>

      <paper-dialog
          id="dialog"
          with-backdrop no-cancel-on-outside-click
          opened="{{opened}}">
        <div class="header layout horizontal justified">
          <h2>Send a message to IMO</h2>

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
              <paper-textarea
                  class="validate"
                  label="Message content"
                  value="{{data.message}}"
                  on-input="_validate"
                  always-float-label
                  required>
              </paper-textarea>
            </div>

            <div class="row">
              <small class="sender-note">Message will be sent from partner: [[partner.title]] ([[partner.email]])</small>
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

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  errors!: GenericObject;

  @property({type: Number})
  clusterId!: number;

  @property({type: Number})
  indicatorId!: number;

  @property({type: Boolean})
  pending: boolean = false;

  @property({type: Object, computed: 'getReduxStateObject(rootState.partner.current)'})
  partner!: GenericObject;

  @property({type: String})
  messageUrl: string = Endpoints.indicatorIMOMessage();


  static get observers() {
    return ['_setDefaults(opened, indicatorId, clusterId)'];
  }

  _validate(e: CustomEvent) {
    (e.target as any).validate();
  }

  _setDefaults(opened: boolean, indicatorId: number, clusterId: number) {
    if (!opened) {
      return;
    }

    this.set('errors', {});

    this.set('data', {
      reportable: indicatorId,
      cluster: clusterId
    });
  }

  _save() {
    const self = this;

    if (!this._fieldsAreValid()) {
      return;
    }

    this.set('pending', true);

    (this.$.message as EtoolsPrpAjaxEl).thunk()()
      .then(() => {
        self.set('pending', false);
        fireEvent(self, 'imo-message-sent');
        self.close();
      })
      .catch((err: GenericObject) => {
        self.set('pending', false);
        self.set('errors', err.data);
      });
  }

}

window.customElements.define('message-imo-modal', MessageImoModal);

export {MessageImoModal as MessageImoModalEl};
