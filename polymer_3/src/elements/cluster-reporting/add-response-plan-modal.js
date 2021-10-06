var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-radio-button/paper-radio-button';
import '@polymer/paper-radio-group/paper-radio-group';
import '@polymer/paper-item/paper-item';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-loading/etools-loading';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../mixins/utils-mixin';
import ModalMixin from '../../mixins/modal-mixin';
import { buttonsStyles } from '../../styles/buttons-styles';
import { modalStyles } from '../../styles/modal-styles';
import '../etools-prp-permissions';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import { configClusterTypes } from '../../redux/selectors/config';
import { workspaceId } from '../../redux/selectors/workspace';
import './response-plan-details';
import '../error-box';
import { fireEvent } from '../../utils/fire-custom-event';
import { fetchConfig } from '../../redux/actions/config';
import { addResponsePlan } from '../../redux/actions';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin ModalMixin
 */
class AddResponsePlanModal extends UtilsMixin(ModalMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.updatePending = false;
        this.configUrl = Endpoints.config();
        this.types = [
            { title: 'HRP', id: 'HRP' },
            { title: 'FA', id: 'FA' },
            { title: 'OTHER', id: 'OTHER' }
        ];
        this.plans = [];
        this.selectedPlan = '';
        this.clusterSelectionChanged = false;
    }
    static get template() {
        // language=HTML
        return html `
    ${buttonsStyles} ${modalStyles}
     <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
      :host {
        display: block;

        --app-grid-columns: 3;
        --app-grid-gutter: 0px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 3;

        --paper-dialog: {
          width: 800px;
        }
      }

      .full-width {
        @apply --app-grid-expandible-item;
      }

      .fields {
        position: relative;
        padding: 0px 30px;
      }

      #mode {
        margin-bottom: 12px;
      }

      #mode paper-radio-button {
        padding-top: 12px;
        display: block;
        margin-left: -12px;
      }

      paper-dialog-scrollable {
        padding-bottom: 20px;
      }

      etools-dropdown, etools-dropdown-multi, datepicker-lite {
        width: 100%;
      }
      .start-date, .end-date{
          --paper-input-container_-_width: 100%;
      }
      .app-grid{
        padding-right: 90px;
        padding-left: 30px;
      }

    </style>

    <etools-prp-permissions
      permissions="{{ permissions }}">
    </etools-prp-permissions>

    <etools-prp-ajax
      id="plan"
      url="[[createPlanUrl]]"
      method="post"
      content-type="application/json">
    </etools-prp-ajax>

    <etools-prp-ajax
      id="plans"
      timeout="100000"
      url="[[ochaPlansUrl]]">
    </etools-prp-ajax>

    <etools-prp-ajax
      id="config"
      url="[[configUrl]]">
    </etools-prp-ajax>

    <etools-prp-ajax
      id="planDetails"
      url="[[planDetailsUrl]]"
      timeout="100000">
    </etools-prp-ajax>


    <paper-dialog
      id="dialog"
      with-backdrop
      opened="{{opened}}">
      <div class="header layout horizontal justified">
        <h2>Add Response Plan</h2>
        <paper-icon-button
          class="self-center"
          on-tap="close"
          icon="icons:close">
        </paper-icon-button>
      </div>

      <paper-dialog-scrollable>
        <error-box errors="[[errors]]"></error-box>

        <paper-radio-group id="mode" selected="{{mode}}">
          <paper-radio-button name="ocha">
            <strong>From OCHA</strong>
          </paper-radio-button>

          <paper-radio-button name="custom">
            <strong>Custom</strong>
          </paper-radio-button>
        </paper-radio-group>

        <div class="fields" empty$="[[!_equals(mode, 'ocha')]]">
          <template
            is="dom-if"
            if="[[_equals(mode, 'ocha')]]"
            restamp="true">
            <div>
              <etools-dropdown
                class="item validate full-width"
                label="Response Plan"
                options="[[formattedPlans]]"
                option-value="id"
                option-label="title"
                selected="{{selectedPlan}}"
                disabled="[[plansLoading]]"
                on-etools-selected-item-changed="_validate"
                trigger-value-change-event
                required>
              </etools-dropdown>
              <response-plan-details
                id="details"
                plan-data="[[planDetails]]"
                loading="[[planDetailsLoading]]"
                error="[[emptyClustersError]]">
              </response-plan-details>
              <etools-loading active$="[[plansLoading]]"></etools-loading>
            </div>
          </template>
        </div>

      <div empty$="[[!_equals(mode, 'custom')]]">
        <template
          is="dom-if"
          if="[[_equals(mode, 'custom')]]"
          restamp="true">
          <div class="app-grid">
            <div class="item full-width">
              <paper-input
                class="validate full-width"
                label="Response Plan"
                value="{{data.title}}"
                on-input="_validate"
                always-float-label
                required>
              </paper-input>
            </div>
            <div class="item">
              <etools-dropdown
                  class="validate"
                  label="Plan Type"
                  options="[[types]]"
                  option-value="id"
                  option-label="title"
                  selected="{{data.plan_type}}"
                  auto-validate
                  hide-search
                  required>
              </etools-dropdown>
            </div>
            <template is="dom-if" if="[[_equals(data.plan_type, 'OTHER')]]" restamp="true">
              <div class="item">
                <paper-input
                  class="validate item full-width"
                  label="Custom Plan Type"
                  value="{{data.plan_custom_type_label}}"
                  on-input="_validate"
                  always-float-label
                  required
                  maxlength="255">
                </paper-input>
              </div>
            </template>
            <div class="item">
              <datepicker-lite
                class="start-date"
                label="Start date"
                value="{{data.start}}"
                error-message=""
                selected-date-display-format="D MMM YYYY"
                required>
              </datepicker-lite>
            </div>

            <div class="item">
              <datepicker-lite
                class="end-date"
                label="End date"
                value="{{data.end}}"
                error-message=""
                selected-date-display-format="D MMM YYYY"
                required>
              </datepicker-lite>
            </div>
            <div class="item full-width">
              <etools-dropdown-multi
                class="validate"
                label="Clusters"
                options="[[clusters]]"
                option-value="value"
                option-label="label"
                selected-values="{{data.clusters}}"
                on-etools-selected-items-changed="_validate"
                trigger-value-change-event
                hide-close
                error-message=""
                required>
              </etools-dropdown-multi>
            </div>
          </div>
        </template>
      </div>

      </paper-dialog-scrollable>

      <div class="buttons layout horizontal-reverse">
        <paper-button
          on-tap="_savePlan"
          class="btn-primary"
          disabled="[[emptyClustersError]]"
          raised>
          Save
        </paper-button>

        <paper-button
          class='btn-cancel'
          on-tap="close">
          Cancel
        </paper-button>
      </div>

      <etools-loading active="[[updatePending]]"></etools-loading>
    </paper-dialog>
    `;
    }
    static get observers() {
        return [
            '_fetchPlans(mode, ochaPlansUrl)',
            '_fetchConfig(mode, configUrl)',
            '_fetchPlanDetails(planDetailsUrl)',
            '_setEmptyClustersError(planDetails, mode)'
        ];
    }
    _configClusterTypes(rootState) {
        return configClusterTypes(rootState);
    }
    _workspaceId(rootState) {
        return workspaceId(rootState);
    }
    _computeCreatePlanUrl(workspaceId, mode) {
        if (mode === 'ocha') {
            return Endpoints.ochaResponsePlans(workspaceId);
        }
        return Endpoints.customResponsePlan(workspaceId);
    }
    _computeOchaPlansUrl(workspaceId) {
        return Endpoints.ochaResponsePlans(workspaceId);
    }
    _computePlanDetailsUrl(planId) {
        if (planId) {
            return Endpoints.ochaResponsePlanDetails(planId);
        }
        return '';
    }
    _setDefaults() {
        this.set('selectedPlan', '');
        this.set('plansLoading', false);
        this.set('data', {});
        this.set('planDetails', {});
        this.set('errors', {});
        this.clusterSelectionChanged = false;
    }
    _onOpenedChanged(opened) {
        if (opened) {
            this.set('mode', '');
        }
    }
    controlValueChanged(e) {
        if (e.type === 'etools-selected-items-changed' && !this.clusterSelectionChanged) {
            if (!e.detail.selectedItems.length) {
                return false;
            }
            else {
                this.clusterSelectionChanged = true;
            }
        }
        return true;
    }
    _validate(e) {
        if (this.controlValueChanged(e)) {
            e.target.validate();
        }
    }
    _computeFormattedPlans(plans) {
        return plans.map(function (plan) {
            return { id: plan.id, title: plan.name };
        });
    }
    _computeCurrentPlan(plans, selectedPlan) {
        return plans.filter(function (plan) {
            return plan.id === selectedPlan;
        })[0];
    }
    _setEmptyClustersError(planDetails, mode) {
        setTimeout(() => {
            this.set('emptyClustersError', mode === 'ocha' &&
                planDetails &&
                planDetails.clusterNames &&
                !planDetails.clusterNames.length);
        });
    }
    _fetchPlans(mode) {
        if (mode !== 'ocha') {
            return;
        }
        this.set('plansLoading', true);
        const self = this;
        const thunk = this.$.plans.thunk();
        this.$.plans.abort();
        thunk()
            .then((res) => {
            self.set('plansLoading', false);
            self.set('plans', res.data);
        })
            .catch((err) => {
            if (err.code === 504) {
                fireEvent(self, 'notify', { type: 'ocha-timeout' });
            }
            self.set('plansLoading', false);
            self.set('errors', err.data);
        });
    }
    _fetchPlanDetails(url) {
        if (!url) {
            return;
        }
        this.set('planDetailsLoading', true);
        const self = this;
        const thunk = this.$.planDetails.thunk();
        this.$.planDetails.abort();
        thunk()
            .then((res) => {
            self.set('planDetailsLoading', false);
            self.set('planDetails', res.data);
            fireEvent(self, 'details-loaded');
        })
            .catch((err) => {
            if (err.code === 504) {
                fireEvent(self, 'notify', { type: 'ocha-timeout' });
            }
            self.set('planDetailsLoading', false);
            self.set('errors', err.data);
        });
    }
    _fetchConfig(mode) {
        if (mode !== 'custom') {
            return;
        }
        const configThunk = this.$.config.thunk();
        this.$.config.thunk();
        const self = this;
        this.$.config.abort();
        this.reduxStore.dispatch(fetchConfig(configThunk, configClusterTypes))
            // @ts-ignore
            .catch(function (err) {
            self.set('errors', err.data);
        });
    }
    _savePlan() {
        const self = this;
        this.set('updatePending', true);
        const bodyThunk = this.$.plan.thunk();
        if (this.mode === 'ocha') {
            this.$.plan.body = { plan: this.selectedPlan };
        }
        else {
            this.$.plan.body = Object.assign({}, this.data);
        }
        bodyThunk()
            .then((res) => {
            self.set('updatePending', false);
            self.close();
            self.set('errors', {});
            self.reduxStore.dispatch(addResponsePlan(res.data));
            fireEvent(self, 'refresh-plan-list');
            fireEvent(self, 'fetch-profile');
        })
            .catch((err) => {
            self.set('updatePending', false);
            if (err.code === 504) {
                fireEvent(self, 'notify', { type: 'ocha-timeout' });
            }
            self.set('errors', err.data);
        });
    }
    _addEventListeners() {
        this.adjustPosition = this.adjustPosition.bind(this);
        this.addEventListener('details-loaded', this.adjustPosition);
        this.addEventListener('paper-radio-group-changed', this.adjustPosition);
    }
    _removeEventListeners() {
        this.removeEventListener('details-loaded', this.adjustPosition);
        this.removeEventListener('paper-radio-group-changed', this.adjustPosition);
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
    property({ type: Object })
], AddResponsePlanModal.prototype, "data", void 0);
__decorate([
    property({ type: Boolean })
], AddResponsePlanModal.prototype, "updatePending", void 0);
__decorate([
    property({ type: String, observer: '_setDefaults' })
], AddResponsePlanModal.prototype, "mode", void 0);
__decorate([
    property({ type: Boolean, observer: '_onOpenedChanged' })
], AddResponsePlanModal.prototype, "opened", void 0);
__decorate([
    property({ type: String, computed: '_workspaceId(rootState)' })
], AddResponsePlanModal.prototype, "workspaceId", void 0);
__decorate([
    property({ type: String })
], AddResponsePlanModal.prototype, "configUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeOchaPlansUrl(workspaceId)' })
], AddResponsePlanModal.prototype, "ochaPlansUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeCreatePlanUrl(workspaceId, mode)' })
], AddResponsePlanModal.prototype, "createPlanUrl", void 0);
__decorate([
    property({ type: String, computed: '_computePlanDetailsUrl(selectedPlan)' })
], AddResponsePlanModal.prototype, "planDetailsUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeFormattedPlans(plans)' })
], AddResponsePlanModal.prototype, "formattedPlans", void 0);
__decorate([
    property({ type: String, computed: '_computeCurrentPlan(plans, selectedPlan)' })
], AddResponsePlanModal.prototype, "currentPlan", void 0);
__decorate([
    property({ type: Array })
], AddResponsePlanModal.prototype, "types", void 0);
__decorate([
    property({ type: Array })
], AddResponsePlanModal.prototype, "plans", void 0);
__decorate([
    property({ type: String })
], AddResponsePlanModal.prototype, "selectedPlan", void 0);
__decorate([
    property({ type: Array, computed: '_configClusterTypes(rootState)' })
], AddResponsePlanModal.prototype, "clusters", void 0);
__decorate([
    property({ type: Boolean })
], AddResponsePlanModal.prototype, "emptyClustersError", void 0);
__decorate([
    property({ type: Boolean })
], AddResponsePlanModal.prototype, "plansLoading", void 0);
__decorate([
    property({ type: Object })
], AddResponsePlanModal.prototype, "planDetails", void 0);
__decorate([
    property({ type: Boolean })
], AddResponsePlanModal.prototype, "clusterSelectionChanged", void 0);
window.customElements.define('add-response-plan-modal', AddResponsePlanModal);
export { AddResponsePlanModal as AddResponsePlanModalEl };
