import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
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
import Endpoints from '../../etools-prp-common/endpoints';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import ModalMixin from '../../etools-prp-common/mixins/modal-mixin';
import {buttonsStyles} from '../../etools-prp-common/styles/buttons-styles';
import {modalStyles} from '../../etools-prp-common/styles/modal-styles';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import '../../etools-prp-common/elements/etools-prp-permissions';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {configClusterTypes} from '../../redux/selectors/config';
import {workspaceId} from '../../redux/selectors/workspace';
import './response-plan-details';
import '../error-box';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import {fireEvent} from '../../etools-prp-common/utils/fire-custom-event';
import {fetchConfig} from '../../etools-prp-common/redux/actions/config';
import {addResponsePlan} from '../../etools-prp-common/redux/actions';
import {RootState} from '../../etools-prp-common/typings/redux.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin ModalMixin
 */
class AddResponsePlanModal extends UtilsMixin(ModalMixin(ReduxConnectedElement)) {
  public static get template() {
    // language=HTML
    return html`
      ${buttonsStyles} ${modalStyles}
      <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;

          --app-grid-columns: 3;
          --app-grid-gutter: 0px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 3;

          --paper-dialog: {
            width: 820px;
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

        etools-dropdown,
        etools-dropdown-multi,
        datepicker-lite,
        paper-input {
          width: 100%;
        }
        .start-date,
        .end-date {
          --paper-input-container_-_width: 100%;
        }
        .app-grid {
          padding-right: 90px;
          padding-left: 30px;
        }
      </style>

      <etools-prp-permissions permissions="{{ permissions }}"> </etools-prp-permissions>

      <etools-prp-ajax id="plan" url="[[createPlanUrl]]" method="post" content-type="application/json">
      </etools-prp-ajax>

      <etools-prp-ajax id="plans" timeout="100000" url="[[ochaPlansUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="config" url="[[configUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="planDetails" url="[[planDetailsUrl]]" timeout="100000"> </etools-prp-ajax>

      <paper-dialog id="dialog" modal opened="{{opened}}">
        <div class="header layout horizontal justified">
          <h2>Add Response Plan</h2>
          <paper-icon-button class="self-center" on-tap="close" icon="icons:close"> </paper-icon-button>
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
            <template is="dom-if" if="[[_equals(mode, 'ocha')]]" restamp="true">
              <div>
                <etools-dropdown
                  class="item validate full-width"
                  label="Response Plan"
                  options="[[formattedPlans]]"
                  option-value="id"
                  option-label="title"
                  selected="{{selectedPlan}}"
                  disabled="[[plansLoading]]"
                  on-etools-selected-item-changed$="_validate"
                  trigger-value-change-event
                  no-dynamic-align
                  with-backdrop
                  required
                >
                </etools-dropdown>
                <response-plan-details
                  id="details"
                  plan-data="[[planDetails]]"
                  loading="[[planDetailsLoading]]"
                  error="[[emptyClustersError]]"
                >
                </response-plan-details>
                <etools-loading active$="[[plansLoading]]"></etools-loading>
              </div>
            </template>
          </div>

          <div empty$="[[!_equals(mode, 'custom')]]">
            <template is="dom-if" if="[[_equals(mode, 'custom')]]" restamp="true">
              <div class="app-grid">
                <div class="item full-width">
                  <paper-input
                    class="validate full-width"
                    label="Response Plan"
                    value="{{data.title}}"
                    on-input="_validate"
                    always-float-label
                    required
                  >
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
                    disabled="[[plansLoading]]"
                    auto-validate
                    hide-search
                    with-backdrop
                    required
                  >
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
                      maxlength="255"
                    >
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
                    required
                  >
                  </datepicker-lite>
                </div>

                <div class="item">
                  <datepicker-lite
                    class="end-date"
                    label="End date"
                    value="{{data.end}}"
                    error-message=""
                    selected-date-display-format="D MMM YYYY"
                    required
                  >
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
                    with-backdrop
                    required
                  >
                  </etools-dropdown-multi>
                </div>
              </div>
            </template>
          </div>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button on-tap="_savePlan" class="btn-primary" disabled="[[emptyClustersError]]" raised>
            Save
          </paper-button>

          <paper-button class="btn-cancel" on-tap="close"> Cancel </paper-button>
        </div>

        <etools-loading active="[[updatePending]]"></etools-loading>
      </paper-dialog>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Boolean})
  updatePending = false;

  @property({type: String, observer: '_setDefaults'})
  mode!: string;

  @property({type: Boolean, observer: '_onOpenedChanged'})
  opened!: boolean;

  @property({type: String, computed: '_workspaceId(rootState)'})
  workspaceId!: string;

  @property({type: String})
  configUrl = Endpoints.config();

  @property({type: String, computed: '_computeOchaPlansUrl(workspaceId)'})
  ochaPlansUrl!: string;

  @property({type: String, computed: '_computeCreatePlanUrl(workspaceId, mode)'})
  createPlanUrl!: string;

  @property({type: String, computed: '_computePlanDetailsUrl(selectedPlan)'})
  planDetailsUrl!: string;

  @property({type: String, computed: '_computeFormattedPlans(plans)'})
  formattedPlans!: string;

  @property({type: String, computed: '_computeCurrentPlan(plans, selectedPlan)'})
  currentPlan!: string;

  @property({type: Array})
  types = [
    {title: 'HRP', id: 'HRP'},
    {title: 'FA', id: 'FA'},
    {title: 'OTHER', id: 'OTHER'}
  ];

  @property({type: Array})
  plans = [];

  @property({type: String})
  selectedPlan = '';

  @property({type: Array, computed: '_configClusterTypes(rootState)'})
  clusters!: any[];

  @property({type: Boolean})
  emptyClustersError!: boolean;

  @property({type: Boolean})
  plansLoading!: boolean;

  @property({type: Object})
  planDetails!: GenericObject;

  @property({type: Boolean})
  clusterSelectionChanged = false;

  static get observers() {
    return [
      '_fetchPlans(mode, ochaPlansUrl)',
      '_fetchConfig(mode, configUrl)',
      '_fetchPlanDetails(planDetailsUrl)',
      '_setEmptyClustersError(planDetails, mode)'
    ];
  }

  _configClusterTypes(rootState: RootState) {
    return configClusterTypes(rootState);
  }

  _workspaceId(rootState: RootState) {
    return workspaceId(rootState);
  }

  _computeCreatePlanUrl(workspaceId: string, mode: string) {
    if (mode === 'ocha') {
      return Endpoints.ochaResponsePlans(workspaceId);
    }
    return Endpoints.customResponsePlan(workspaceId);
  }

  _computeOchaPlansUrl(workspaceId: string) {
    return Endpoints.ochaResponsePlans(workspaceId);
  }

  _computePlanDetailsUrl(planId: string) {
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

  _onOpenedChanged(opened: boolean) {
    if (opened) {
      this.set('mode', '');
    }
  }

  controlValueChanged(e: CustomEvent) {
    if (e.type === 'etools-selected-items-changed' && !this.clusterSelectionChanged) {
      if (!e.detail.selectedItems.length) {
        return false;
      } else {
        this.clusterSelectionChanged = true;
      }
    }
    return true;
  }

  _validate(e: CustomEvent) {
    if (this.controlValueChanged(e)) {
      (e.target as any).validate();
    }
  }

  _computeFormattedPlans(plans: GenericObject[]) {
    return plans.map(function (plan) {
      return {id: plan.id, title: plan.name};
    });
  }

  _computeCurrentPlan(plans: GenericObject[], selectedPlan: string) {
    return plans.filter(function (plan) {
      return plan.id === selectedPlan;
    })[0];
  }

  _setEmptyClustersError(planDetails: GenericObject, mode: string) {
    setTimeout(() => {
      this.set(
        'emptyClustersError',
        mode === 'ocha' && planDetails && planDetails.clusterNames && !planDetails.clusterNames.length
      );
    });
  }

  _fetchPlans(mode: string) {
    if (mode !== 'ocha') {
      return;
    }
    this.set('plansLoading', true);

    const thunk = (this.$.plans as EtoolsPrpAjaxEl).thunk();
    (this.$.plans as EtoolsPrpAjaxEl).abort();

    thunk()
      .then((res: any) => {
        this.set('plansLoading', false);
        this.set('plans', res.data);
      })
      .catch((err: any) => {
        if (err.code === 504) {
          fireEvent(this, 'notify', {type: 'ocha-timeout'});
        }
        this.set('plansLoading', false);
        this.set('errors', err.data);
      });
  }

  _fetchPlanDetails(url: string) {
    if (!url) {
      return;
    }
    this.set('planDetailsLoading', true);

    const thunk = (this.$.planDetails as EtoolsPrpAjaxEl).thunk();
    (this.$.planDetails as EtoolsPrpAjaxEl).abort();
    thunk()
      .then((res: any) => {
        this.set('planDetailsLoading', false);
        this.set('planDetails', res.data);
        fireEvent(this, 'details-loaded');
      })
      .catch((err: any) => {
        if (err.code === 504) {
          fireEvent(this, 'notify', {type: 'ocha-timeout'});
        }
        this.set('planDetailsLoading', false);
        this.set('errors', err.data);
      });
  }

  _fetchConfig(mode: string) {
    if (mode !== 'custom') {
      return;
    }
    const configThunk = (this.$.config as EtoolsPrpAjaxEl).thunk();
    (this.$.config as EtoolsPrpAjaxEl).thunk();
    (this.$.config as EtoolsPrpAjaxEl).abort();
    this.reduxStore
      .dispatch(fetchConfig(configThunk, configClusterTypes))
      // @ts-ignore
      .catch((err: any) => {
        this.set('errors', err.data);
      });
  }

  _savePlan() {
    this.set('updatePending', true);

    const bodyThunk = (this.$.plan as EtoolsPrpAjaxEl).thunk();
    if (this.mode === 'ocha') {
      (this.$.plan as EtoolsPrpAjaxEl).body = {plan: this.selectedPlan};
    } else {
      (this.$.plan as EtoolsPrpAjaxEl).body = Object.assign({}, this.data);
    }

    bodyThunk()
      .then((res: any) => {
        this.set('updatePending', false);
        this.close();
        this.set('errors', {});
        this.reduxStore.dispatch(addResponsePlan(res.data));
        fireEvent(this, 'refresh-plan-list');
        fireEvent(this, 'fetch-profile');
      })
      .catch((err: any) => {
        this.set('updatePending', false);
        if (err.code === 504) {
          fireEvent(this, 'notify', {type: 'ocha-timeout'});
        }
        this.set('errors', err.data);
      });
  }

  _addEventListeners() {
    this.adjustPosition = this.adjustPosition.bind(this);

    this.addEventListener('details-loaded', this.adjustPosition as any);
    this.addEventListener('paper-radio-group-changed', this.adjustPosition as any);
  }

  _removeEventListeners() {
    this.removeEventListener('details-loaded', this.adjustPosition as any);
    this.removeEventListener('paper-radio-group-changed', this.adjustPosition as any);
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

window.customElements.define('add-response-plan-modal', AddResponsePlanModal);

export {AddResponsePlanModal as AddResponsePlanModalEl};
