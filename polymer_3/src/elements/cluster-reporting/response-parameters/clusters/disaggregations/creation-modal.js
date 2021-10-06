var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-form/iron-form';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-location/iron-location';
import '@polymer/paper-styles/typography';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-dialog/paper-dialog';
import '../../../../etools-prp-chips';
import '../../../chip-disagg-value';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import { modalStyles } from '../../../../../styles/modal-styles';
import Endpoints from '../../../../../endpoints';
import { fireEvent } from '../../../../../utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 */
class CreationModalDisaggregation extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.choices = [];
        this.name = '';
        this.opened = false;
        this.updatePending = false;
        this.refresh = false;
    }
    static get template() {
        // language=HTML
        return html `
    ${buttonsStyles} ${modalStyles}
    <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --app-grid-columns: 3;
        --app-grid-gutter: 15px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 3;

        --paper-dialog: {
          width: 700px;
        }
      }
    </style>

    <etools-prp-ajax
        id="createDisaggregation"
        url="[[url]]"
        body="[[data]]"
        content-type="application/json"
        method="post">
    </etools-prp-ajax>

    <paper-dialog
        id="dialog"
        with-backdrop
        opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>[[localize('add_disaggregation')]]</h2>
        <paper-icon-button
            class="self-center"
            on-tap="close"
            icon="icons:close">
        </paper-icon-button>
      </div>

      <paper-dialog-scrollable>
        <template
            is="dom-if"
            if="[[refresh]]"
            restamp="true">
          <iron-form class="app-grid">

            <div class="flex col-name">
              <paper-input
                  class="validate"
                  id="name"
                  name="name"
                  label="[[localize('disaggregation')]]"
                  value="{{data.name}}"
                  on-input="_onInput"
                  on-blur="_formatName"
                  always-float-label
                  required>
              </paper-input>
            </div>
            <div class="flex col-values">
              <etools-prp-chips
                  class="validate"
                  index="0"
                  name="values"
                  label="[[localize('disaggregation_groups')]]"
                  value="{{data.choices}}"
                  on-selected-chips-updated="_onInput"
                  required>
                <chip-disagg-value></chip-disagg-value>
              </etools-prp-chips>
            </div>

          </iron-form>
        </template>
      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button class="btn-primary" on-tap="_save" raised>
          [[localize('save')]]
        </paper-button>

        <paper-button class="btn-cancel" on-tap="close">
          [[localize('cancel')]]
        </paper-button>
      </div>

    </paper-dialog>
    `;
    }
    _computeUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.responseParametersClusterDisaggregations(responsePlanID);
    }
    close() {
        this.set('opened', false);
        this.set('refresh', false);
    }
    open() {
        this.data = { 'response_plan': +this.responsePlanID, 'choices': [], 'active': true };
        this.set('opened', true);
        this.set('refresh', true);
    }
    _save() {
        if (!this._fieldsAreValid()) {
            return;
        }
        if (!this._checkMatchingName()) {
            this.shadowRoot.querySelector('#name').set('invalid', true);
            return;
        }
        const self = this;
        const thunk = this.$.createDisaggregation.thunk();
        const newChoices = [];
        for (let i = 0; i < this.data.choices.length; i++) {
            newChoices.push({ 'value': this.data.choices[i], 'active': true });
        }
        this.data.choices = newChoices;
        thunk()
            .then((res) => {
            fireEvent(self, 'disaggregation-added', res.data);
            self.updatePending = false;
            self.close();
        })
            .catch((_err) => {
            // TODO: error handling
            self.updatePending = false;
        });
    }
    _checkMatchingName() {
        const disaggregations = this.disaggregations;
        for (let i = 0; i < disaggregations.length; i++) {
            if (disaggregations[i].name === this.data.name.trim()) {
                return false;
            }
        }
        return true;
    }
    _onInput(e) {
        const el = e.target;
        el.validate();
    }
    _formatName(e) {
        const el = e.target;
        el.value = el.value.trim();
        el.validate();
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], CreationModalDisaggregation.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: Array, notify: true })
], CreationModalDisaggregation.prototype, "choices", void 0);
__decorate([
    property({ type: String, notify: true })
], CreationModalDisaggregation.prototype, "name", void 0);
__decorate([
    property({ type: Boolean })
], CreationModalDisaggregation.prototype, "opened", void 0);
__decorate([
    property({ type: Boolean })
], CreationModalDisaggregation.prototype, "updatePending", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanID)' })
], CreationModalDisaggregation.prototype, "url", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.clusterDisaggregations.all)' })
], CreationModalDisaggregation.prototype, "disaggregations", void 0);
__decorate([
    property({ type: Object })
], CreationModalDisaggregation.prototype, "editData", void 0);
__decorate([
    property({ type: Object })
], CreationModalDisaggregation.prototype, "data", void 0);
__decorate([
    property({ type: Boolean })
], CreationModalDisaggregation.prototype, "refresh", void 0);
window.customElements.define('cluster-disaggregations-modal', CreationModalDisaggregation);
export { CreationModalDisaggregation as CreationModalDisaggregationEl };
