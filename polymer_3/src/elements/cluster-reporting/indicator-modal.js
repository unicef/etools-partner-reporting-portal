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
import '@polymer/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-radio-button/paper-radio-button';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import './disaggregations-dropdown-widget';
import './indicator-locations-widget';
import './chip-date-of-report';
import '../labelled-item';
import '../etools-prp-chips';
import '../etools-prp-ajax';
import '../json-field';
import '../calculation-method';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import ModalMixin from '../../mixins/modal-mixin';
import { buttonsStyles } from '../../styles/buttons-styles';
import { modalStyles } from '../../styles/modal-styles';
import '../error-box';
import '../form-fields/cluster-dropdown-content';
import { property } from '@polymer/decorators/lib/decorators';
import Settings from '../../settings';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { fireEvent } from '../../utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin ModalMixin
 */
class IndicatorModal extends LocalizeMixin(ModalMixin(UtilsMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.indicatorsUrl = '';
        this.indicatorsListUrl = Endpoints.indicators('co') + '/';
        this.indicatorsListParams = {};
        this.activitiesParams = {
            page_size: 99999,
        };
        this.activities = [];
        this.selectedActivity = '';
        this.clusters = [];
        this.selectedCluster = '';
        this.objectives = [];
        this.selectedObjective = '';
        this.objectivesParams = {};
        this.indicators = [];
        this.selectedIndicator = '';
        this.updatePending = false;
        this.disaggregationsParams = {
            page_size: 99999
        };
        this.selectedDisaggregations = [];
        this.frequencies = [
            {
                id: 'Wee',
                title: 'Weekly'
            },
            {
                id: 'Mon',
                title: 'Monthly'
            },
            {
                id: 'Qua',
                title: 'Quarterly'
            },
            {
                id: 'Csd',
                title: 'Custom specific dates'
            }
        ];
        this.disaggregations = [];
        this.dateFormat = Settings.dateFormat;
    }
    static get template() {
        return html `
      ${buttonsStyles} ${modalStyles}
      <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;

          --app-grid-columns: 2;
          --app-grid-gutter: 24px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;

          --paper-radio-group-item-padding: 12px;

          --paper-dialog: {
            width: 800px;
          }
        }

        .row {
          margin: 16px 0;
        }

        .full-width {
          @apply --app-grid-expandible-item;
          padding-top: 12px;
        }

        .app-grid {
          padding-top: 0;
        }

        .double {
          padding-left: 0;
          justify-content: space-between;
        }

        .title {
          padding-top: 0;
        }

        .pair {
          margin-right: 0;
        }

        .app-grid-triple {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-direction: row;
        }

        .app-grid-triple .item {
          width: 210px;
        }

        .item {
          margin-bottom: 0 !important;
          padding-right: 0;
        }

        #mode {
          margin-bottom: 24px;
        }

        #mode paper-radio-button {
          padding-top: 24px;
          display: block;
        }

        #custom-form-only {
          padding-top: 20px;
        }

        .calculation-method:not(:first-child) {
          margin-left: 50px;
        }

        paper-radio-group {
          margin-left: -12px;
        }

        indicator-locations-widget {
          margin: 2em 0;
        }

        datepicker-lite {
          --paper-input-container_-_width: 100%;
        }

        .app-grid > * {
          margin-bottom: 0px;
        }

        .fields{
          margin-bottom: 24px;
        }
      </style>

      <cluster-dropdown-content clusters="{{clusters}}"></cluster-dropdown-content>

      <etools-prp-ajax
        id="disaggregations"
        url="[[disaggregationsUrl]]"
        params="[[disaggregationsParams]]">
      </etools-prp-ajax>

      <etools-prp-ajax
        id="activities"
        params="[[activitiesParams]]"
        url="[[activitiesUrl]]">
      </etools-prp-ajax>

      <etools-prp-ajax
        id="indicators"
        url="[[indicatorsUrl]]"
        method="post"
        body="[[data]]"
        content-type="application/json">
      </etools-prp-ajax>

      <etools-prp-ajax
        id="objectives"
        timeout="100000"
        url="[[objectivesUrl]]"
        params="[[objectivesParams]]">
      </etools-prp-ajax>

      <etools-prp-ajax
        id="indicatorsList"
        timeout="100000"
        url="[[indicatorsListUrl]]"
        params="[[indicatorsListParams]]">
      </etools-prp-ajax>

      <etools-prp-ajax
        id="indicatorDetail"
        timeout="100000">
      </etools-prp-ajax>

      <paper-dialog
        id="dialog"
        with-backdrop
        on-iron-overlay-closed="_close"
        opened="{{opened}}">

        <div class="header layout horizontal justified">
          <h2>[[_localizeLowerCased(modalTitle, localize)]]</h2>

          <paper-icon-button
            class="self-center"
            on-tap="_close"
            icon="icons:close">
          </paper-icon-button>
        </div>

        <paper-dialog-scrollable>
          <template
            is="dom-if"
            if="[[opened]]"
            restamp="true">
            <error-box errors="[[errors]]"></error-box>

            <template
              is="dom-if"
              if="[[!_isClusterImo(prpRoles)]]"
              restamp="true">

              <paper-radio-group id="mode" selected="{{mode}}" on-change="adjustPosition">
                <paper-radio-button name="objectives">
                  <strong>[[localize('adopt_from_cluster_objective')]]</strong>
                </paper-radio-button>
                <paper-radio-button name="custom">
                  <strong>[[localize('custom')]]</strong>
                </paper-radio-button>
              </paper-radio-group>

               <div class="fields" empty$="[[!_equals(mode, 'objectives')]]">
                  <template
                    is="dom-if"
                    if="[[_equals(mode, 'objectives')]]"
                    restamp="true">

                    <div class="app-grid">
                      <div class="item">
                        <etools-dropdown
                            id="clustersDropdown"
                            class="validate"
                            label="[[localize('clusters')]] *"
                            options="[[clusters]]"
                            option-value="id"
                            option-label="title"
                            selected="{{selectedCluster}}"
                            disabled="[[_equals(selectedPartner, '')]]"
                            auto-validate
                            required>
                        </etools-dropdown>
                      </div>

                      <div class="item">
                        <etools-dropdown
                            class="validate"
                            label="[[localize('objective')]] *"
                            options="[[objectives]]"
                            option-value="id"
                            option-label="title"
                            selected="{{selectedObjective}}"
                            disabled="[[_equals(objectives.length, 0)]]"
                            auto-validate
                            required>
                        </etools-dropdown>
                      </div>

                      <div class="item full-width">
                        <etools-dropdown
                            class="validate"
                            label="[[localize('indicator')]] *"
                            options="[[indicators]]"
                            option-value="id"
                            option-label="title"
                            selected="{{selectedIndicator}}"
                            disabled="[[_equals(indicators.length, 0)]]"
                            auto-validate
                            required>
                        </etools-dropdown>
                      </div>

                      <json-field
                        class="item validate"
                        id="target"
                        label="[[localize('baseline')]]"
                        value="{{ data.baseline }}"
                        type="[[selectedIndicatorDetailType]]"
                        allowed-pattern="[+\\-\\d.]"
                        on-input="_validate"
                        required>
                      </json-field>

                      <json-field
                        class="item validate"
                        id="total"
                        label="[[localize('target')]]"
                        value="{{ data.target }}"
                        type="[[selectedIndicatorDetailType]]"
                        allowed-pattern="[+\\-\\d.]"
                        on-input="_validate"
                        required>
                      </json-field>

                      <template
                        is="dom-if"
                        if="[[selectedIndicatorDetailType]]"
                        restamp="true">
                        <div class="item full-width">
                          <indicator-locations-widget
                            class="validate"
                            indicator-type="[[selectedIndicatorDetailType]]"
                            value="{{ data.locations }}">
                          </indicator-locations-widget>
                        </div>
                      </template>

                    </div>
                  </template>
                </div>

                <div
                  class="fields"
                  empty$="[[!_equals(mode, 'custom')]]">
                  <template
                    is="dom-if"
                    if="[[_equals(mode, 'custom')]]"
                    restamp="true">

                    <div class="app-grid">
                      <div class="item full-width title">
                        <paper-input
                          class="validate"
                          label="[[localize('title')]]"
                          on-input="_validate"
                          value="{{data.blueprint.title}}"
                          always-float-label
                          required>
                        </paper-input>
                      </div>

                      <div class="item full-width">
                        <labelled-item label="[[localize('type')]]">
                          <paper-radio-group selected="{{data.blueprint.display_type}}">
                            <paper-radio-button name="number">[[localize('quantity')]]</paper-radio-button>
                            <paper-radio-button name="percentage">[[localize('percent')]]</paper-radio-button>
                            <paper-radio-button name="ratio">[[localize('ratio')]]</paper-radio-button>
                          </paper-radio-group>
                        </labelled-item>
                      </div>

                      <div class="item full-width">
                        <div class="layout horizontal">
                          <labelled-item
                            class="calculation-method"
                            label="[[localize('calculation_method_across_locations')]]">
                            <calculation-method
                              value="{{data.blueprint.calculation_formula_across_locations}}"
                              disabled="[[!isNumber]]">
                            </calculation-method>
                          </labelled-item>

                          <labelled-item
                            class="calculation-method"
                            label="[[localize('calculation_method_across_reporting')]]">
                            <calculation-method
                              value="{{data.blueprint.calculation_formula_across_periods}}"
                              disabled="[[!isNumber]]">
                            </calculation-method>
                          </labelled-item>
                        </div>
                      </div>

                      <div class="item full-width">
                        <paper-input
                          class="validate"
                          label="[[localize('comments')]]"
                          on-input="_validate"
                          value="{{data.comments}}"
                          always-float-label>
                        </paper-input>
                      </div>

                      <div class="item full-width">
                        <paper-input
                          class="validate"
                          label="[[localize('measurement_specifications')]]"
                          on-input="_validate"
                          value="{{data.measurement_specifications}}"
                          always-float-label>
                        </paper-input>
                      </div>

                      <div class="item full-width">
                        <div class="app-grid double">
                          <etools-dropdown
                              class="item validate pair"
                              label="[[localize('frequency_of_reporting')]]"
                              options="[[frequencies]]"
                              option-value="id"
                              option-label="title"
                              selected="{{data.frequency}}"
                              auto-validate
                              hide-search
                              required>
                          </etools-dropdown>
                          <template
                              is="dom-if"
                              if="[[_showCSD(data.frequency)]]"
                              restamp="true">
                            <etools-prp-chips
                              class="item validate"
                              value="{{data.cs_dates}}"
                              label="[[localize('due_date_of_report')]]"
                              on-selected-chips-updated="_validate"
                              required>
                              <chip-date-of-report min-date="[[_minDate]]"></chip-date-of-report>
                            </etools-prp-chips>
                          </template>
                          <datepicker-lite
                              class="item validate pair"
                              label="[[localize('start_date_reporting')]]"
                              value="{{data.start_date_of_reporting_period}}"
                              error-message=""
                              selected-date-display-format="[[dateFormat]]">
                          </datepicker-lite>
                        </div>
                      </div>

                      <div class="item full-width">
                        <template
                          is="dom-if"
                          if="[[isNumber]]"
                          restamp="true">
                          <paper-input
                            class="validate"
                            label="[[localize('label')]]"
                            on-input="_validate"
                            value="{{data.label}}"
                            always-float-label
                            required>
                          </paper-input>
                        </template>

                        <template
                          is="dom-if"
                          if="[[!isNumber]]"
                          restamp="true">
                          <div class="app-grid double">
                            <paper-input
                              class="item validate pair"
                              label="[[localize('numerator_label')]]"
                              on-input="_validate"
                              value="{{data.numerator_label}}"
                              always-float-label
                              required>
                            </paper-input>

                            <paper-input
                              class="item validate pair"
                              label="[[localize('denominator_label')]]"
                              on-input="_validate"
                              value="{{data.denominator_label}}"
                              always-float-label
                              required>
                            </paper-input>
                          </div>
                        </template>
                      </div>

                      <div class="item full-width">
                        <template
                          is="dom-if"
                          if="[[isNumber]]"
                          restamp="true">
                          <div class="app-grid-triple">
                            <json-field
                              class="item validate"
                              type="[[data.blueprint.display_type]]"
                              label="[[localize('baseline')]]"
                              on-input="_validate"
                              value="{{data.baseline}}"
                              allowed-pattern="[+\\-\\d]"
                              required>
                            </json-field>

                            <json-field
                              class="item validate"
                              type="[[data.blueprint.display_type]]"
                              label="[[localize('in_need')]]"
                              on-input="_validate"
                              value="{{data.in_need}}"
                              allowed-pattern="[+\\-\\d]">
                            </json-field>

                            <json-field
                              class="item validate"
                              type="[[data.blueprint.display_type]]"
                              label="[[localize('target')]]"
                              on-input="_validate"
                              value="{{data.target}}"
                              allowed-pattern="[+\\-\\d]"
                              required>
                            </json-field>
                          </div>
                        </template>
                      </div>

                      <div class="item full-width">
                        <template
                          is="dom-if"
                          if="[[!isNumber]]"
                          restamp="true">
                          <div class="app-grid double">
                            <json-field
                              class="item validate pair"
                              type="[[data.blueprint.display_type]]"
                              label="[[localize('baseline')]]"
                              on-input="_validate"
                              value="{{data.baseline}}"
                              allowed-pattern="[+\\-\\d]"
                              required>
                            </json-field>

                            <json-field
                              class="item validate pair"
                              type="[[data.blueprint.display_type]]"
                              label="[[localize('target')]]"
                              on-input="_validate"
                              value="{{data.target}}"
                              allowed-pattern="[+\\-\\d]"
                              required>
                            </json-field>
                          </div>
                        </template>
                      </div>

                      <div class="item full-width">
                        <indicator-locations-widget
                          class="validate"
                          indicator-type="[[data.blueprint.display_type]]"
                          is-pai="[[_isPAI(activityData)]]"
                          editing="[[false]]"
                          value="{{data.locations}}">
                        </indicator-locations-widget>
                      </div>

                      <div class="item full-width">
                        <disaggregations-dropdown-widget
                          class="validate"
                          value="{{selectedDisaggregations}}"
                          disaggregations="[[disaggregations]]">
                        </disaggregations-dropdown-widget>
                      </div>
                    </div>

                  </template>
                </div>
            </template>

            <template
              is="dom-if"
              if="[[_isClusterImo(prpRoles)]]"
              restamp="true">

              <div class="app-grid" id="custom-form-only">
                <div class="item full-width title">
                  <paper-input
                    class="validate"
                    label="[[localize('title')]]"
                    on-input="_validate"
                    value="{{data.blueprint.title}}"
                    always-float-label
                    required>
                  </paper-input>
                </div>

                <div class="item full-width">
                  <labelled-item label="[[localize('type')]]">
                    <paper-radio-group selected="{{data.blueprint.display_type}}">
                      <paper-radio-button name="number">[[localize('quantity')]]</paper-radio-button>
                      <paper-radio-button name="percentage">[[localize('percent')]]</paper-radio-button>
                      <paper-radio-button name="ratio">[[localize('ratio')]]</paper-radio-button>
                    </paper-radio-group>
                  </labelled-item>
                </div>

                <div class="item full-width">
                  <div class="layout horizontal">
                    <labelled-item
                      class="calculation-method"
                      label="[[localize('calculation_method_across_locations')]]">
                      <calculation-method
                        value="{{data.blueprint.calculation_formula_across_locations}}"
                        disabled="[[!isNumber]]">
                      </calculation-method>
                    </labelled-item>

                    <labelled-item
                      class="calculation-method"
                      label="[[localize('calculation_method_across_reporting')]]">
                      <calculation-method
                        value="{{data.blueprint.calculation_formula_across_periods}}"
                        disabled="[[!isNumber]]">
                      </calculation-method>
                    </labelled-item>
                  </div>
                </div>

                <div class="item full-width">
                  <paper-input
                    class="validate"
                    label="[[localize('comments')]]"
                    on-input="_validate"
                    value="{{data.comments}}"
                    always-float-label>
                  </paper-input>
                </div>

                <div class="item full-width">
                  <paper-input
                    class="validate"
                    label="[[localize('measurement_specifications')]]"
                    on-input="_validate"
                    value="{{data.measurement_specifications}}"
                    always-float-label>
                  </paper-input>
                </div>

                <template
                is="dom-if"
                if="[[_equals(modalTitle, 'Add Activity Indicator')]]"
                restamp="true">
                  <div class="item full-width">
                    <etools-dropdown
                        class="item validate pair"
                        label="[[localize('project_context')]]"
                        options="[[activityData.projects]]"
                        option-value="context_id"
                        option-label="project_name"
                        selected="{{data.project_context_id}}"
                        auto-validate
                        hide-search
                        required>
                    </etools-dropdown>
                  </div>
                </template>

                <div class="item full-width">
                  <div class="app-grid double">
                    <etools-dropdown
                        class="item validate pair"
                        label="[[localize('frequency_of_reporting')]]"
                        options="[[frequencies]]"
                        option-value="id"
                        option-label="title"
                        selected="{{data.frequency}}"
                        auto-validate
                        hide-search
                        required>
                    </etools-dropdown>
                    <template
                        is="dom-if"
                        if="[[_showCSD(data.frequency)]]"
                        restamp="true">
                      <etools-prp-chips
                        class="item validate"
                        value="{{data.cs_dates}}"
                        label="[[localize('due_date_of_report')]]"
                        on-selected-chips-updated="_validate"
                        required>
                        <chip-date-of-report min-date="[[_minDate]]"></chip-date-of-report>
                      </etools-prp-chips>
                    </template>
                    <datepicker-lite
                        class="item validate pair"
                        label="[[localize('start_date_reporting')]]"
                        value="{{data.start_date_of_reporting_period}}"
                        error-message=""
                        selected-date-display-format="[[dateFormat]]">
                    </datepicker-lite>
                  </div>
                </div>

                <div class="item full-width">
                  <template
                    is="dom-if"
                    if="[[isNumber]]"
                    restamp="true">
                    <paper-input
                      class="validate"
                      label="[[localize('label')]]"
                      on-input="_validate"
                      value="{{data.label}}"
                      always-float-label
                      required>
                    </paper-input>
                  </template>

                  <template
                    is="dom-if"
                    if="[[!isNumber]]"
                    restamp="true">
                    <div class="app-grid double">
                      <paper-input
                        class="item validate pair"
                        label="[[localize('numerator_label')]]"
                        on-input="_validate"
                        value="{{data.numerator_label}}"
                        always-float-label
                        required>
                      </paper-input>

                      <paper-input
                        class="item validate pair"
                        label="[[localize('denominator_label')]]"
                        on-input="_validate"
                        value="{{data.denominator_label}}"
                        always-float-label
                        required>
                      </paper-input>
                    </div>
                  </template>
                </div>

                <div class="item full-width">
                  <template
                    is="dom-if"
                    if="[[isNumber]]"
                    restamp="true">
                    <div class="app-grid-triple">
                      <json-field
                        class="item validate"
                        type="[[data.blueprint.display_type]]"
                        label="[[localize('baseline')]]"
                        on-input="_validate"
                        value="{{data.baseline}}"
                        allowed-pattern="[+\\-\\d]"
                        required>
                      </json-field>

                      <json-field
                        class="item validate"
                        type="[[data.blueprint.display_type]]"
                        label="[[localize('in_need')]]"
                        on-input="_validate"
                        value="{{data.in_need}}"
                        allowed-pattern="[+\\-\\d]">
                      </json-field>

                      <json-field
                        class="item validate"
                        type="[[data.blueprint.display_type]]"
                        label="[[localize('target')]]"
                        on-input="_validate"
                        value="{{data.target}}"
                        allowed-pattern="[+\\-\\d]"
                        required>
                      </json-field>
                    </div>
                  </template>
                </div>

                <div class="item full-width">
                  <template
                    is="dom-if"
                    if="[[!isNumber]]"
                    restamp="true">
                    <div class="app-grid double">
                      <json-field
                        class="item validate pair"
                        type="[[data.blueprint.display_type]]"
                        label="[[localize('baseline')]]"
                        on-input="_validate"
                        value="{{data.baseline}}"
                        allowed-pattern="[+\\-\\d]"
                        required>
                      </json-field>

                      <json-field
                        class="item validate pair"
                        type="[[data.blueprint.display_type]]"
                        label="[[localize('target')]]"
                        on-input="_validate"
                        value="{{data.target}}"
                        allowed-pattern="[+\\-\\d]"
                        required>
                      </json-field>
                    </div>
                  </template>
                </div>

                <div class="item full-width">
                  <indicator-locations-widget
                    class="validate"
                    indicator-type="[[data.blueprint.display_type]]"
                    is-pai="[[_isPAI(activityData)]]"
                    editing="[[false]]"
                    value="{{data.locations}}">
                  </indicator-locations-widget>
                </div>

                <div class="item full-width">
                  <disaggregations-dropdown-widget
                    class="validate"
                    value="{{selectedDisaggregations}}"
                    disaggregations="[[disaggregations]]">
                  </disaggregations-dropdown-widget>
                </div>
              </div>
            </template>

          </template>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button
              on-tap="_save"
              class="btn-primary"
              raised>
            [[localize('save')]]
          </paper-button>

          <paper-button class="btn-cancel"
              on-tap="_close">
            [[localize('cancel')]]
          </paper-button>
        </div>

        <etools-loading active="[[updatePending]]"></etools-loading>
      </paper-dialog>
    `;
    }
    static get observers() {
        return ['_setDefaults(opened)',
            '_isClusterImo(prpRoles)',
            '_resetCalculationFormulas(isNumber)',
            '_resetFields(isNumber)',
            '_updateCSDates(data.start_date_of_reporting_period)',
            '_saveCluster(selectedCluster)',
            '_fetchActivities(selectedCluster)',
            '_fetchObjectivesList(selectedCluster)',
            '_fetchIndicatorsList(selectedObjective)',
            '_fetchActivityIndicatorsList(selectedActivity)',
            '_fetchSelectedIndicatorDetailType(responsePlanId, selectedIndicator)'];
    }
    adjustPosition(e) {
        if (!e) {
            return;
        }
        e.stopPropagation();
        // _adjustPositionDebouncer is from ModalMixin
        this._adjustPositionDebouncer = Debouncer.debounce(this._adjustPositionDebouncer, timeOut.after(250), () => {
            this.$.dialog.refit();
        });
    }
    _isClusterImo(prpRoles) {
        const isImo = prpRoles.find(function (role) {
            return role.role === 'CLUSTER_IMO';
        });
        if (isImo !== undefined && this.modalTitle === 'Add Cluster Objective Indicator' ||
            isImo !== undefined && this.modalTitle === 'Add Activity Indicator' ||
            isImo !== undefined && this.modalTitle === 'Add Cluster Activity Indicator') {
            this.set('mode', 'custom');
            return true;
        }
        else if (isImo !== undefined && this.modalTitle === 'Add Project Indicator') {
            this.set('imoInPartner', true);
            return false;
        }
        else {
            return false;
        }
    }
    _computeIsNumber(type) {
        return type === 'number';
    }
    _resetCalculationFormulas(isNumber) {
        if (isNumber) {
            return;
        }
        const formula = 'sum';
        this.set('data.blueprint.calculation_formula_across_locations', formula);
        this.set('data.blueprint.calculation_formula_across_periods', formula);
    }
    _resetFields(isNumber) {
        const data = this.get('data');
        let newData;
        if (isNumber) {
            newData = this._omit(data, ['numerator_label', 'denominator_label']);
        }
        else {
            newData = this._omit(data, ['label', 'in_need']);
        }
        this.set('data', newData);
    }
    // @ts-ignore
    _setFrequency(e, data) {
        const freq = this.shadowRoot.querySelector('#frequencies').itemForElement(data.value);
        if (!freq) {
            return;
        }
        this.set('data.frequency', freq.id);
    }
    _isPAI(activityData) {
        return Object.keys(activityData).length !== 0;
    }
    _setDisaggregations() {
        const selected = this.selectedDisaggregations ?
            this.selectedDisaggregations.map(function (dis) {
                return {
                    id: dis.id
                };
            }) : [];
        this.set('data.disaggregations', selected);
    }
    _setDefaults(opened) {
        if (!opened) {
            return;
        }
        if (this.mode === undefined) {
            return;
        }
        if (this.mode === 'objectives') {
            this.set('data', {
                partner_id: this.projectData ? this.projectData.partner_id : this.partnerID,
                partner_project_id: '',
                cluster_id: '',
                cluster_objective_id: '',
                reportable_id: '',
                locations: [],
                target: { d: 1 },
                baseline: { d: 1 }
            });
            this.set('indicatorsUrl', Endpoints.adoptedClusterIndicators());
        }
        else {
            this.set('selectedDisaggregations', []);
            this.set('errors', {});
            this.set('data', {
                blueprint: {
                    display_type: 'number',
                    calculation_formula_across_locations: 'sum',
                    calculation_formula_across_periods: 'sum'
                },
                cs_dates: [],
                locations: [],
                disaggregations: []
            });
            if (this.mode === 'activity') {
                this.set('indicatorsListUrl', Endpoints.indicators('ca') + '/');
            }
            this.set('indicatorsUrl', Endpoints.clusterIndicators());
            this._fetchDisaggregations();
        }
        // @ts-ignore
        this.adjustPosition();
    }
    _validate(e) {
        e.target.validate();
    }
    _showCSD(frequency) {
        return frequency && this._equals(frequency, 'Csd');
    }
    _computeDisaggregationsUrl(responsePlanId) {
        return Endpoints.responseParametersClusterDisaggregations(responsePlanId);
    }
    _computeMinDate(date) {
        return date ? this._normalizeDate(date) : null;
    }
    _computeObjectivesUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.responseParametersClusterObjectives(responsePlanId);
    }
    _fetchDisaggregations() {
        const self = this;
        this.$.disaggregations.thunk()()
            .then((res) => {
            self.set('disaggregations', res.data.results);
        });
    }
    _savePartner(selectedPartnerId) {
        this.set('data.partner_id', selectedPartnerId);
    }
    _saveCluster() {
        if (this.mode === 'objectives') {
            this.set('data.cluster_id', this.selectedCluster);
        }
    }
    _fetchActivities(clusterId) {
        const self = this;
        if (typeof clusterId === 'undefined' || typeof this.responsePlanId === 'undefined') {
            return;
        }
        this.set('activities', []);
        this.set('activitiesParams.cluster_id', clusterId);
        this.set('activitiesUrl', Endpoints.responseParametersClusterActivities(this.responsePlanId) +
            '?cluster_id=' + clusterId);
        this.$.activities.abort();
        this.$.activities.thunk()()
            .then((res) => {
            self.set('activities', res.data.results);
        })
            .catch((_err) => {
            // TODO: error handling
        });
    }
    _fetchActivityIndicatorsList(selectedId) {
        if (selectedId === '') {
            return;
        }
        this.set('indicatorsListParams', { object_id: selectedId, page_size: 9999, page: 1 });
        this._fetchIndDebouncer = Debouncer.debounce(this._fetchIndDebouncer, timeOut.after(250), () => {
            const self = this;
            this.set('indicators', []);
            this.$.indicatorsList.abort();
            this.$.indicatorsList.thunk()()
                .then((res) => {
                const simpleIndicatorsList = [];
                res.data.results.forEach((indicator) => {
                    const simpleIndicator = indicator;
                    simpleIndicator.title = indicator.blueprint.title;
                    simpleIndicatorsList.push(simpleIndicator);
                });
                self.set('indicators', simpleIndicatorsList);
                fireEvent(self, 'details-loaded');
            });
        });
    }
    _fetchObjectivesList(selectedClusterId) {
        if (selectedClusterId === '') {
            return;
        }
        if (this.mode === 'objectives') {
            this.set('data.cluster_id', selectedClusterId);
            this.set('data.partner_project_id', String(this.objectId));
        }
        this._fetchObjectivesDebouncer = Debouncer.debounce(this._fetchObjectivesDebouncer, timeOut.after(250), () => {
            const self = this;
            this.set('objectives', []);
            this.set('objectivesParams.cluster_id', selectedClusterId);
            this.$.objectives.abort();
            this.$.objectives.thunk()()
                .then((res) => {
                self.set('objectives', res.data.results);
                fireEvent(self, 'details-loaded');
            })
                .catch((_err) => {
                // TODO: error handling
            });
        });
    }
    _fetchIndicatorsList(selectedObjectiveId) {
        if (selectedObjectiveId === '') {
            return;
        }
        this.set('data.cluster_objective_id', selectedObjectiveId);
        this.set('indicatorsListParams', { object_id: selectedObjectiveId });
        this._fetchIndDebouncer = Debouncer.debounce(this._fetchIndDebouncer, timeOut.after(250), () => {
            const self = this;
            this.set('indicators', []);
            this.$.indicatorsList.abort();
            this.$.indicatorsList.thunk()()
                .then((res) => {
                const simpleIndicatorsList = [];
                res.data.results.forEach(function (indicator) {
                    const simpleIndicator = {};
                    simpleIndicator.id = indicator.id;
                    simpleIndicator.title = indicator.blueprint.title;
                    simpleIndicatorsList.push(simpleIndicator);
                });
                self.set('indicators', simpleIndicatorsList);
                fireEvent(self, 'details-loaded');
            })
                .catch((_err) => {
                // TODO: error handling
            });
        });
    }
    _fetchSelectedIndicatorDetailType(responsePlanId, selectedIndicator) {
        if (selectedIndicator === undefined || selectedIndicator === '') {
            return;
        }
        this._fetchSelectedIndDebouncer = Debouncer.debounce(this._fetchSelectedIndDebouncer, timeOut.after(250), () => {
            const self = this;
            if (this.mode === 'objectives') {
                this.set('data.reportable_id', selectedIndicator);
            }
            if (this.mode === 'activity') {
                const chosenActivityIndicator = this.indicators.find(function (indicator) {
                    return indicator.id === selectedIndicator;
                });
                this.set('data.blueprint.title', chosenActivityIndicator.title);
                this.set('data.frequency', chosenActivityIndicator.frequency);
                this.set('data.label', chosenActivityIndicator.label);
                this.set('data.start_date_of_reporting_period', chosenActivityIndicator.start_date_of_reporting_period);
            }
            this.$.indicatorDetail.url = Endpoints.analysisIndicator(responsePlanId, selectedIndicator);
            this.$.indicatorDetail.abort();
            this.$.indicatorDetail.thunk()()
                .then((res) => {
                self.set('selectedIndicatorDetailType', res.data.display_type);
            })
                .catch((_err) => {
                // TODO: error handling
            });
        });
    }
    _processData(rawData) {
        const data = this._clone(rawData);
        const invalidLocations = [];
        if (data.frequency !== 'Csd') {
            delete data.cs_dates;
        }
        data.baseline.v = parseInt(data.baseline.v);
        data.target.v = parseInt(data.target.v);
        if (data.in_need !== undefined) {
            data.in_need.v = parseInt(data.in_need.v);
        }
        if (data.blueprint === undefined) {
            data.baseline.d = 1;
            data.target.d = 1;
            if (data.in_need !== undefined) {
                data.in_need.d = 1;
            }
            data.locations.forEach(function (location, idx, arr) {
                location.baseline.d = 1;
                location.target.d = 1;
                location.baseline.v = parseInt(location.baseline.v);
                location.target.v = parseInt(location.target.v);
                if (data.in_need !== undefined) {
                    if (location.in_need !== undefined) {
                        location.in_need.d = 1;
                        location.in_need.v = parseInt(location.in_need.v);
                        if (location.in_need.v > data.in_need.v) {
                            invalidLocations.push('Location ' + location.title + ' has a greater in need than its indicator-level in need');
                        }
                    }
                    else {
                        invalidLocations.push('Location ' + location.title + ' does not have in need while indicator level in need exists');
                    }
                }
                else {
                    delete location.in_need;
                }
                if (location.baseline.v > data.baseline.v) {
                    invalidLocations.push('Location ' + location.title + ' has a greater baseline than its indicator-level baseline');
                }
                if (location.target.v > data.target.v) {
                    invalidLocations.push('Location ' + location.title + ' has a greater target than its indicator-level target');
                }
                if (location.in_need !== undefined && location.target.v > location.in_need.v) {
                    invalidLocations.push('Location ' + location.title + ' has a target greater than its in need');
                }
                arr[idx] = location;
            });
        }
        else if (data.blueprint.display_type === 'percentage') {
            data.baseline.d = 100;
            data.target.d = 100;
            if (data.in_need !== undefined) {
                data.in_need.d = 100;
            }
            data.locations.forEach(function (location, idx, arr) {
                location.baseline.d = 100;
                location.target.d = 100;
                location.baseline.v = parseInt(location.baseline.v);
                location.target.v = parseInt(location.target.v);
                if (data.in_need !== undefined) {
                    if (location.in_need !== undefined) {
                        location.in_need.d = 100;
                        location.in_need.v = parseInt(location.in_need.v);
                        if (location.in_need.v > data.in_need.v) {
                            invalidLocations.push('Location ' + location.title + ' has a greater in need than its indicator-level in need');
                        }
                    }
                    else {
                        invalidLocations.push('Location ' + location.title + ' does not have in need while indicator level in need exists');
                    }
                }
                else {
                    delete location.in_need;
                }
                if (location.baseline.v > data.baseline.v) {
                    invalidLocations.push('Location ' + location.title + ' has a greater baseline than its indicator-level baseline');
                }
                if (location.target.v > data.target.v) {
                    invalidLocations.push('Location ' + location.title + ' has a greater target than its indicator-level target');
                }
                if (location.in_need !== undefined && location.target.v > location.in_need.v) {
                    invalidLocations.push('Location ' + location.title + ' has a target greater than its in need');
                }
                arr[idx] = location;
            });
        }
        else if (data.blueprint.display_type === 'number') {
            data.baseline.d = 1;
            data.target.d = 1;
            if (data.in_need !== undefined) {
                data.in_need.d = 1;
            }
            data.locations.forEach(function (location, idx, arr) {
                location.baseline.d = 1;
                location.target.d = 1;
                location.baseline.v = parseInt(location.baseline.v);
                location.target.v = parseInt(location.target.v);
                if (data.in_need !== undefined) {
                    if (location.in_need !== undefined) {
                        location.in_need.d = 1;
                        location.in_need.v = parseInt(location.in_need.v);
                        if (location.in_need.v > data.in_need.v) {
                            invalidLocations.push('Location ' + location.title + ' has a greater in need than its indicator-level in need');
                        }
                    }
                    else {
                        invalidLocations.push('Location ' + location.title + ' does not have in need while indicator level in need exists');
                    }
                }
                else {
                    delete location.in_need;
                }
                if (location.baseline.v > data.baseline.v) {
                    invalidLocations.push('Location ' + location.title + ' has a greater baseline than its indicator-level baseline');
                }
                if (location.target.v > data.target.v) {
                    invalidLocations.push('Location ' + location.title + ' has a greater target than its indicator-level target');
                }
                if (location.in_need !== undefined && location.target.v > location.in_need.v) {
                    invalidLocations.push('Location ' + location.title + ' has a target greater than its in need');
                }
                arr[idx] = location;
            });
        }
        else if (data.blueprint.display_type === 'ratio') {
            data.baseline.d = parseInt(data.baseline.d);
            data.target.d = parseInt(data.target.d);
            if (data.in_need !== undefined) {
                data.in_need.d = parseInt(data.in_need.d);
                data.in_need.c = data.in_need.v / data.in_need.d;
            }
            data.baseline.c = data.baseline.v / data.baseline.d;
            data.target.c = data.target.v / data.target.d;
            data.locations.forEach((location, idx, arr) => {
                location.baseline.v = parseInt(location.baseline.v);
                location.target.v = parseInt(location.target.v);
                location.baseline.d = parseInt(location.baseline.d);
                location.target.d = parseInt(location.target.d);
                location.baseline.c = location.baseline.v / location.baseline.d;
                location.target.c = location.target.v / location.target.d;
                if (data.in_need !== undefined) {
                    if (location.in_need !== undefined) {
                        location.in_need.d = parseInt(location.in_need.d);
                        location.in_need.v = parseInt(location.in_need.v);
                        location.in_need.c = location.in_need.v / location.in_need.d;
                        if (location.in_need.c > data.in_need.c) {
                            invalidLocations.push('Location ' + location.title + ' has a greater in need than its indicator-level in need');
                        }
                    }
                    else {
                        invalidLocations.push('Location ' + location.title + ' does not have in need while indicator level in need exists');
                    }
                }
                else {
                    delete location.in_need;
                }
                if (location.baseline.c > data.baseline.c) {
                    invalidLocations.push('Location ' + location.title + ' has a greater baseline than its indicator-level baseline');
                }
                if (location.target.c > data.target.c) {
                    invalidLocations.push('Location ' + location.title + ' has a greater target than its indicator-level target');
                }
                if (location.in_need !== undefined && location.target.c > location.in_need.c) {
                    invalidLocations.push('Location ' + location.title + ' has a target greater than its in need');
                }
                arr[idx] = location;
            });
        }
        if (invalidLocations.length !== 0) {
            return invalidLocations;
        }
        return Object.assign(data, {
            object_id: this.objectId,
            object_type: this.objectType,
        });
    }
    _updateCSDates(startDateStr) {
        if (!startDateStr) {
            return;
        }
        const dates = this.get('data.cs_dates');
        const startDate = this._normalizeDate(startDateStr);
        this.set('data.cs_dates', dates && dates.filter((d) => {
            return this._normalizeDate(d) >= startDate;
        }, this));
    }
    _save() {
        const self = this;
        const dataCopy = this._clone(this.data);
        let noLocationSet = false;
        const rawLocations = this.get('data.locations') || [];
        const changedLocations = rawLocations.map(function (location) {
            if (location.location && location.location.id) {
                const id = location.location.id;
                const title = location.location.title;
                location.location = id;
                location.title = title;
                return location;
            }
            else if (location.loc_type && !location.location) {
                self.set('errors', 'No location set - please set a location.');
                noLocationSet = true;
                return location;
            }
            else {
                return location;
            }
        });
        if (noLocationSet) {
            return;
        }
        if (!this._fieldsAreValid()) {
            return;
        }
        this.set('data.locations', changedLocations);
        this._setDisaggregations();
        const data = this._processData(this.get('data'));
        if (data instanceof Array) {
            this.set('errors', { locations: data });
            return;
        }
        this.set('data', data);
        this.$.indicators.body = data;
        this.set('updatePending', true);
        this.$.indicators.thunk()()
            .then((res) => {
            fireEvent(self, 'indicator-added', res.data);
            self.set('updatePending', false);
            self.set('errors', {});
            self.set('data', {});
            self.set('clusters', []);
            self.set('selectedCluster', '');
            self.set('objectives', []);
            self.set('selectedObjective', '');
            self.set('activities', []);
            self.set('selectedActivity', '');
            self.set('indicators', []);
            self.set('selectedIndicator', '');
            self.set('selectedIndicatorDetailType', undefined);
            if (this.modalTitle === 'Add Project Indicator') {
                self.set('mode', '');
            }
            self.close();
        })
            .catch((err) => {
            self.set('errors', err.data);
            self.set('data.locations', dataCopy.locations);
            self.set('updatePending', false);
        }).finally();
    }
    _close(e) {
        if (e.target.nodeName === 'PAPER-DIALOG' ||
            e.target.nodeName === 'PAPER-BUTTON' ||
            e.target.nodeName === 'PAPER-ICON-BUTTON') {
            if (this.modalTitle === 'Add Project Indicator' || this.modalTitle === 'Add Activity Indicator') {
                this.set('mode', '');
            }
            this.set('data', {});
            this.set('clusters', []);
            this.set('selectedCluster', '');
            this.set('objectives', []);
            this.set('selectedObjective', '');
            this.set('activities', []);
            this.set('selectedActivity', '');
            this.set('indicators', []);
            this.set('selectedIndicator', '');
            this.set('selectedIndicatorDetailType', undefined);
            this.close();
        }
        else {
            return;
        }
    }
}
__decorate([
    property({ type: Object })
], IndicatorModal.prototype, "data", void 0);
__decorate([
    property({ type: Number })
], IndicatorModal.prototype, "objectId", void 0);
__decorate([
    property({ type: Object })
], IndicatorModal.prototype, "activityData", void 0);
__decorate([
    property({ type: Object })
], IndicatorModal.prototype, "projectData", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "objectType", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "modalTitle", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeIsNumber(data.blueprint.display_type)' })
], IndicatorModal.prototype, "isNumber", void 0);
__decorate([
    property({ type: String, observer: '_setDefaults' })
], IndicatorModal.prototype, "mode", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], IndicatorModal.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String, computed: '_computeDisaggregationsUrl(responsePlanId)' })
], IndicatorModal.prototype, "disaggregationsUrl", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "indicatorsUrl", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "indicatorsListUrl", void 0);
__decorate([
    property({ type: Object })
], IndicatorModal.prototype, "indicatorsListParams", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "activitiesUrl", void 0);
__decorate([
    property({ type: Object })
], IndicatorModal.prototype, "activitiesParams", void 0);
__decorate([
    property({ type: Array })
], IndicatorModal.prototype, "activities", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "selectedActivity", void 0);
__decorate([
    property({ type: Array })
], IndicatorModal.prototype, "clusters", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "selectedCluster", void 0);
__decorate([
    property({ type: Array })
], IndicatorModal.prototype, "objectives", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "selectedObjective", void 0);
__decorate([
    property({ type: Object })
], IndicatorModal.prototype, "objectivesParams", void 0);
__decorate([
    property({ type: Array })
], IndicatorModal.prototype, "indicators", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "selectedIndicator", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "selectedIndicatorDetailType", void 0);
__decorate([
    property({ type: String, computed: '_computeObjectivesUrl(responsePlanId)' })
], IndicatorModal.prototype, "objectivesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.partner.current.id)' })
], IndicatorModal.prototype, "partnerID", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.prp_roles)' })
], IndicatorModal.prototype, "prpRoles", void 0);
__decorate([
    property({ type: Boolean })
], IndicatorModal.prototype, "updatePending", void 0);
__decorate([
    property({ type: Object })
], IndicatorModal.prototype, "disaggregationsParams", void 0);
__decorate([
    property({ type: Array, notify: true })
], IndicatorModal.prototype, "selectedDisaggregations", void 0);
__decorate([
    property({ type: Array })
], IndicatorModal.prototype, "frequencies", void 0);
__decorate([
    property({ type: Array })
], IndicatorModal.prototype, "disaggregations", void 0);
__decorate([
    property({ type: String })
], IndicatorModal.prototype, "dateFormat", void 0);
__decorate([
    property({ type: Object, computed: '_computeMinDate(data.start_date_of_reporting_period)' })
], IndicatorModal.prototype, "_minDate", void 0);
window.customElements.define('indicator-modal', IndicatorModal);
export { IndicatorModal as IndicatorModalEl };
