var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
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
import { buttonsStyles } from '../../styles/buttons-styles';
import { modalStyles } from '../../styles/modal-styles';
import '../error-box';
import { property } from '@polymer/decorators/lib/decorators';
import { fireEvent } from '../../utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 */
class MessageImoModal extends ModalMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.pending = false;
        this.messageUrl = Endpoints.indicatorIMOMessage();
    }
    static get template() {
        return html `
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
          with-backdrop
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
    static get observers() {
        return ['_setDefaults(opened, indicatorId, clusterId)'];
    }
    _validate(e) {
        e.target.validate();
    }
    _setDefaults(opened, indicatorId, clusterId) {
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
        this.$.message.thunk()()
            .then(() => {
            self.set('pending', false);
            fireEvent(self, 'imo-message-sent');
            self.close();
        })
            .catch((err) => {
            self.set('pending', false);
            self.set('errors', err.data);
        });
    }
}
__decorate([
    property({ type: Object })
], MessageImoModal.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], MessageImoModal.prototype, "errors", void 0);
__decorate([
    property({ type: Number })
], MessageImoModal.prototype, "clusterId", void 0);
__decorate([
    property({ type: Number })
], MessageImoModal.prototype, "indicatorId", void 0);
__decorate([
    property({ type: Boolean })
], MessageImoModal.prototype, "pending", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partner.current)' })
], MessageImoModal.prototype, "partner", void 0);
__decorate([
    property({ type: String })
], MessageImoModal.prototype, "messageUrl", void 0);
window.customElements.define('message-imo-modal', MessageImoModal);
export { MessageImoModal as MessageImoModalEl };
