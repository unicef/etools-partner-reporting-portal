import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-radio-button/paper-radio-button';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
// did not find bellow
//import '@unicef-polymer/etools-searchable-multiselection-menu/etools-multi-selection-menu';
//import '@unicef-polymer/etools-searchable-multiselection-menu/etools-single-selection-menu';
import '@unicef-polymer/etools-loading/etools-loading';
// <link rel="import" href = "../../polyfills/es6-shim.html" >
import Endpoints from '../../endpoints'
import UtilsMixin from '../../mixins/utils-mixin';
import ModalMixin from '../../mixins/modal-mixin';
import {buttonsStyles} from '../../styles/buttons-styles';
import {modalStyles} from '../../styles/modal-styles';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import '../etools-prp-permissions';
// import '../etools-prp-date';
import '../../redux/selectors/config';
import '../../redux/selectors/workspace';
import './response-plan-details';
//bellow original: error-box.html
import '../error-box-errors';
import './paper-radio-group-custom';
import {GenericObject} from '../../typings/globals.types';
import {fireEvent} from '../../utils/fire-custom-event';
import {fetchConfig, configClusterTypes} from '../../redux/actions/config';

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
        --app-grid-gutter: 24px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 3;

        --paper-dialog: {
          width: 600px; & > *{
        margin: 0;
      }
      };
      }

      .full-width {
        @apply --app-grid-expandible-item;
      }

      .fields {
        position: relative;
      }

      paper-radio-group-custom {
        display: block;
        padding-top: 16px;
      }

      paper-radio-group-custom > .fields {
        padding: calc(var(--app-grid-gutter) / 2) 0;
      }

      paper-radio-group-custom > .fields[empty] {
        padding: 0;
      }

      paper-radio-group-custom .app-grid {
        margin: -var(--app-grid-gutter);
      }

      paper-radio-button {
        margin-left: -12px;
      }

      paper-dropdown-menu {
        width: 100%;
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
      opened="{{ opened }}">
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
        <paper-radio-group-custom
          id="mode"
          selected="{{ mode }}">
          <paper-radio-button name="ocha">
            <strong>From OCHA</strong>
          </paper-radio-button>
          <div
            class="fields"
            empty$="[[!_equals(mode, 'ocha')]]">
            <template
              is="dom-if"
              if="[[_equals(mode, 'ocha')]]"
              restamp="true">
              <div>
                <etools-single-selection-menu
                  class="item validate full-width"
                  label="Response Plan"
                  options="[[formattedPlans]]"
                  option-value="id"
                  option-label="title"
                  selected="{{ selectedPlan }}"
                  on-iron-activate="_validate"
                  disabled="[[plansLoading]]"
                  trigger-value-change-event
                  required>
                </etools-single-selection-menu>
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

          <paper-radio-button name="custom">
            <strong>Custom</strong>
          </paper-radio-button>

          <div
            empty$="[[!_equals(mode, 'custom')]]">
            <template
              is="dom-if"
              if="[[_equals(mode, 'custom')]]"
              restamp="true">
              <div class="app-grid">
                <div class="item full-width">
                  <paper-input
                    class="validate item full-width"
                    label="Response Plan"
                    value="{{ data.title }}"
                    on-input="_validate"
                    always-float-label
                    required>
                  </paper-input>
                </div>
                <div class="item">
                  <etools-single-selection-menu
                    class="validate"
                    label="Plan Type"
                    options="[[types]]"
                    option-value="id"
                    option-label="title"
                    selected="{{ data.plan_type }}"
                    on-iron-activate="_validate"
                    trigger-value-change-event
                    hide-search
                    required>
                  </etools-single-selection-menu>
                </div>
                <template is="dom-if" if="[[_equals(data.plan_type, 'OTHER')]]" restamp="true">
                  <div class="item">
                    <paper-input
                      class="validate item full-width"
                      label="Custom Plan Type"
                      value="{{ data.plan_custom_type_label }}"
                      on-input="_validate"
                      always-float-label
                      required
                      maxlength="255">
                    </paper-input>
                  </div>
                </template>
                <div class="item">
                  <etools-prp-date-input
                    class="start-date"
                    label="Start date"
                    value="{{ data.start }}"
                    error-message=""
                    required
                    no-init>
                  </etools-prp-date-input>
                </div>
                <div class="item">
                  <etools-prp-date-input
                    class="end-date"
                    label="End date"
                    value="{{ data.end }}"
                    error-message=""
                    required
                    no-init>
                  </etools-prp-date-input>
                </div>
                <div class="item full-width">
                  <etools-multi-selection-menu
                    class="validate"
                    label="Clusters"
                    options="[[clusters]]"
                    option-value="value"
                    option-label="label"
                    selected-values="{{ data.clusters }}"
                    on-selected-values-changed="_validate"
                    trigger-value-change-event
                    required>
                  </etools-multi-selection-menu>
                </div>
              </div>
            </template>
          </div>
        </paper-radio-group-custom>
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
          on-tap="close">
          Cancel
        </paper-button>
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

  @property({type: String, computed: 'getReduxStateValue(rootState.App.Selectors.Workspace.id)'})
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
    {title: 'OTHER', id: 'OTHER'},
  ];

  @property({type: Array})
  plans = [];

  @property({type: String})
  selectedPlan = '';

  @property({type: String, computed: 'getReduxStateValue(rootState.App.Selectors.Config.clusterTypes)'})
  clusters!: string;

  @property({type: Boolean})
  emptyClustersError!: boolean;

  static get observers() {
    return [
      '_fetchPlans(mode, ochaPlansUrl)',
      '_fetchConfig(mode, configUrl)',
      '_fetchPlanDetails(planDetailsUrl)',
      '_setEmptyClustersError(planDetails, mode)',
    ];
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
    if (planId !== '') {
      return Endpoints.ochaResponsePlanDetails(planId);
    }
    //@Lajos: it had no default return
    return;
  }

  _setDefaults() {
    this.set('selectedPlan', '');
    this.set('plansLoading', false);
    this.set('data', {});
    this.set('planDetails', {});
    this.set('errors', {});
  }

  _onOpenedChanged(opened: boolean) {
    if (opened) {
      this.set('mode', '');
    }
  }

  _validate(e: CustomEvent) {
    e.target!.validate();
  }

  _computeFormattedPlans(plans: GenericObject) {
    return plans.map(function(plan) {
      return {id: plan.id, title: plan.name};
    });
  },

  _computeCurrentPlan(plans: GenericObject, selectedPlan: string) {
    return plans.filter(function(plan) {
      return plan.id === selectedPlan;
    })[0];
  },

  _setEmptyClustersError(planDetails: string, mode: string) {
    setTimeout(() => {
      this.set(
        'emptyClustersError',
        mode === 'ocha' &&
        planDetails &&
        planDetails.clusterNames &&
        !planDetails.clusterNames.length
      );
    });
  }

  _fetchPlans(mode: string) {
    if (mode !== 'ocha') {
      return;
    }
    this.set('plansLoading', true);
    var self = this;
    var thunk = (this.$.plans as EtoolsPrpAjaxEl).thunk();
    (this.$.plans as EtoolsPrpAjaxEl).abort();

    thunk()
      .then(function(res: any) {
        self.set('plansLoading', false);
        self.set('plans', res.data);
      })
      .catch(function(err: any) { // jshint ignore:line
        if (err.code === 504) {
          //@Lajos: please check bellow
          fireEvent('notify', {type: 'ocha-timeout'});
        }
        self.set('plansLoading', false);
        self.set('errors', err.data);
      });
  }

  _fetchPlanDetails(url: string) {
    if (!url) {
      return;
    }
    this.set('planDetailsLoading', true);
    var self = this;
    var thunk = (this.$.planDetails as EtoolsPrpAjaxEl).thunk();
    (this.$.planDetails as EtoolsPrpAjaxEl).abort();
    thunk()
      .then(function(res: any) {
        self.set('planDetailsLoading', false);
        self.set('planDetails', res.data);
        fireEvent('details-loaded');
      })
      .catch(function(err: any) { // jshint ignore:line
        if (err.code === 504) {
          fireEvent('notify', {type: 'ocha-timeout'});
        }
        self.set('planDetailsLoading', false);
        self.set('errors', err.data);
      });
  }

  _fetchConfig(mode: string) {
    if (mode !== 'custom') {
      return;
    }
    var configThunk = (this.$.config as EtoolsPrpAjaxEl).thunk();
    (this.$.config as EtoolsPrpAjaxEl).thunk();
    var self = this;
    (this.$.config as EtoolsPrpAjaxEl).abort();
    this.reduxStore.dispatch(
      fetchConfig(configThunk, configClusterTypes)
    )
      .catch(function(err: any) { // jshint ignore:line
        self.set('errors', err.data);
      });
  }

  _savePlan() {
    var self = this;
    this.set('updatePending', true);

    var bodyThunk = (this.$.plan as EtoolsPrpAjaxEl).thunk();
    //@Lajos: please check bellow, not sure about this.$.plan.body
    if (this.mode === 'ocha') {
      this.$.plan.body = {plan: this.selectedPlan};
    } else {
      this.$.plan.body = Object.assign({}, this.data);
    }
    bodyThunk()
      .then(function(res: any) {
        self.set('updatePending', false);
        self.close();
        self.set('errors', {});
        this.reduxStore.dispatch(App.Actions.addResponsePlan(res.data));
        fireEvent('refresh-plan-list');
        fireEvent('fetch-profile');
      })
      .catch(function(err: any) {
        if (err.code === 504) {
          fireEvent('notify', {type: 'ocha-timeout'});
        }
        self.set('errors', err.data);
        self.set('updatePending', false);
      });
  }

  _addEventListeners() {
    this.adjustPosition = this.adjustPosition.bind(this);
    //@Lajos: bellow show error
    // this.addEventListener('details-loaded', this.adjustPosition);
    // this.addEventListener('mode.selected-changed', this.adjustPosition);
  }

  _removeEventListeners() {
    //@Lajos: bellow show error
    // this.removeEventListener('details-loaded', this.adjustPosition);
    // this.removeEventListener('mode.selected-changed', this.adjustPosition);
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

