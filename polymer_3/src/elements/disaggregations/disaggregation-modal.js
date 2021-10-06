var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import { html } from '@polymer/polymer';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-loading/etools-loading';
import ModalMixin from '../../mixins/modal-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import { buttonsStyles } from '../../styles/buttons-styles';
import { modalStyles } from '../../styles/modal-styles';
import '../confirm-box';
import '../disaggregations/disaggregation-table';
/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin LocalizeMixin
 */
class DisaggregationModal extends ModalMixin(LocalizeMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.updatePending = false;
    }
    static get template() {
        // language=HTML
        return html `
    ${buttonsStyles} ${modalStyles}
    <style include="iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --paper-dialog: {
          width: 700px;
        }
      }
      ::slotted([slot=disaggregation-table]) {
        margin-bottom: 1em;
      }
    </style>

    <paper-dialog
        id="dialog"
        with-backdrop
        opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>[[localize('enter_data')]]</h2>

        <div class="layout horizontal">
          <p>[[localize('reporting_period')]]: [[reportingPeriod]]</p>

          <paper-icon-button
              class="self-center"
              on-tap="close"
              icon="icons:close">
          </paper-icon-button>
        </div>
      </div>

      <paper-dialog-scrollable>
        <slot name="meta"></slot>
        <slot name="disaggregation-table" class="table"></slot>
      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button
            class="btn-primary"
            on-tap="_save"
            raised>
          [[localize('save')]]
        </paper-button>

        <paper-button
            class="btn-cancel"
            on-tap="close">
          [[localize('cancel')]]
        </paper-button>
      </div>

      <confirm-box id="confirm"></confirm-box>

      <etools-loading active="[[updatePending]]"></etools-loading>
    </paper-dialog>
    `;
    }
    _save() {
        const tableSlot = this.shadowRoot.querySelectorAll('.table')[0];
        let tableElem = null;
        if (tableSlot && tableSlot.assignedElements) {
            tableSlot.assignedElements().forEach((el) => {
                if (!tableElem && String(el.tagName).toUpperCase() === 'DISAGGREGATION-TABLE') {
                    tableElem = el;
                }
            });
        }
        if (tableElem) {
            const self = this;
            this.set('updatePending', true);
            tableElem.save()
                .then(() => {
                self.set('updatePending', false);
                self.close();
            })
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling
                self.set('updatePending', false);
            });
        }
    }
    _confirm(e) {
        e.stopPropagation();
        this.$.confirm.run({
            body: 'Changing disaggregation will cause your previous data to be lost. ' +
                'Do you want to continue?',
            result: e.detail
        });
    }
    _addEventListeners() {
        this.close = this.close.bind(this);
        this.addEventListener('dialog.iron-overlay-closed', this.close);
        this.adjustPosition = this.adjustPosition.bind(this);
        this.addEventListener('disaggregation-modal-refit', this.adjustPosition);
        this._confirm = this._confirm.bind(this);
        this.addEventListener('disaggregation-modal-confirm', this._confirm);
    }
    _removeEventListeners() {
        this.removeEventListener('dialog.iron-overlay-closed', this.close);
        this.removeEventListener('disaggregation-modal-refit', this.adjustPosition);
        this.removeEventListener('disaggregation-modal-confirm', this._confirm);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: String })
], DisaggregationModal.prototype, "reportingPeriod", void 0);
__decorate([
    property({ type: Boolean })
], DisaggregationModal.prototype, "updatePending", void 0);
window.customElements.define('disaggregation-modal', DisaggregationModal);
export { DisaggregationModal as DisaggregationModalEl };
