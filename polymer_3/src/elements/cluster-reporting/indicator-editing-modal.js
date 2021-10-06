var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import Settings from '../../settings';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
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
import ModalMixin from '../../mixins/modal-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import { buttonsStyles } from '../../styles/buttons-styles';
import { modalStyles } from '../../styles/modal-styles';
import '../error-box';
import '../etools-prp-permissions';
import { fireEvent } from '../../utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin LocalizeMixin
 */
class IndicatorEditingModal extends UtilsMixin(ModalMixin(LocalizeMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.indicatorsUrl = Endpoints.clusterIndicators();
        this.updatePending = false;
        this.locations = [];
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

          --app-grid-columns: 3;
          --app-grid-gutter: 24px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 3;

          --paper-dialog: {
            width: 800px;
          }

        }

        .row {
          margin: 16px 0;
        }

        .full-width {
          @apply --app-grid-expandible-item;
        }

        .app-grid {
           padding-top: 0;
           margin: 0 -var(--app-grid-gutter);
        }

        .item {
          margin-bottom: 0;
        }

        .indicator-type {
          color: var(--theme-secondary-text-color);
        }

        .calculation-method:not(:first-child) {
          margin-left: 50px;
        }

        indicator-locations-widget {
          margin: 2em 0;
        }
      </style>

      <etools-prp-permissions
          permissions="{{permissions}}">
      </etools-prp-permissions>

      <etools-prp-ajax
          id="locations"
          url="[[locationsUrl]]">
      </etools-prp-ajax>

      <etools-prp-ajax
          id="editIndicator"
          url="[[indicatorsUrl]]"
          method="put"
          body="[[data]]"
          content-type="application/json">
      </etools-prp-ajax>

      <paper-dialog
          id="dialog"
          with-backdrop
          opened="{{opened}}">

        <div class="header layout horizontal justified">
          <h2>[[localize('edit_indicator')]]</h2>

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
              <paper-input
                  class="validate"
                  label="[[localize('title')]]"
                  on-input="_validate"
                  value="{{data.blueprint.title}}"
                  always-float-label
                  disabled="[[!canEditDetails]]"
                  required>
              </paper-input>
            </div>

            <div class="row">
              <labelled-item label="[[localize('type')]]">
                <span class="indicator-type">[[indicatorType]]</span>
              </labelled-item>
            </div>

            <div class="row">
              <div class="layout horizontal">
                <labelled-item
                    class="calculation-method"
                    label="[[localize('calculation_method_across_locations')]]">
                  <calculation-method
                      value="{{data.blueprint.calculation_formula_across_locations}}"
                      readonly>
                  </calculation-method>
                </labelled-item>

                <labelled-item
                    class="calculation-method"
                    label="[[localize('calculation_method_across_reporting')]]">
                  <calculation-method
                      value="{{data.blueprint.calculation_formula_across_periods}}"
                      readonly>
                  </calculation-method>
                </labelled-item>
              </div>
            </div>

            <div class="row">
              <paper-input
                  class="validate"
                  label="[[localize('comments')]]"
                  on-input="_validate"
                  value="{{data.comments}}"
                  disabled="[[!canEditDetails]]"
                  always-float-label>
              </paper-input>
            </div>

            <div class="row">
              <paper-input
                  class="validate"
                  label="[[localize('measurement_specifications')]]"
                  on-input="_validate"
                  value="{{data.measurement_specifications}}"
                  disabled="[[!canEditDetails]]"
                  always-float-label>
              </paper-input>
            </div>

            <template
                is="dom-if"
                if="[[isPAI]]"
                restamp="true">
              <div class="row">
                <etools-dropdown
                  class="item validate pair"
                  label="[[localize('project_context')]]"
                  options="[[projects]]"
                  option-value="context_id"
                  option-label="project_name"
                  selected="{{data.project_context_id}}"
                  disabled
                  hide-search
                  auto-validate
                  required>
                </etools-dropdown>
              </div>
            </template>

            <div class="row">
              <div class="app-grid">
                <etools-dropdown
                    class="item validate"
                    label="[[localize('frequency_of_reporting')]]"
                    options="[[_computeLocalizedFrequencies(frequencies, localize)]]"
                    option-value="id"
                    option-label="title"
                    selected="{{data.frequency}}"
                    disabled="[[!canEditDetails]]"
                    hide-search
                    auto-validate
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
                      disabled="[[!canEditDetails]]"
                      required>
                    <template
                        is="dom-if"
                        if="[[canEditDetails]]"
                        restamp="true">
                      <chip-date-of-report min-date="[[_minDate]]"></chip-date-of-report>
                    </template>
                  </etools-prp-chips>
                </template>
                <datepicker-lite
                  class="item validate"
                  label="[[localize('start_date_reporting')]]"
                  value="{{data.start_date_of_reporting_period}}"
                  disabled="[[!canEditDetails]]"
                  selected-date-display-format="[[dateFormat]]"
                  error-message="">
                </datepicker-lite>
              </div>
            </div>

            <div class="row">
              <template
                  is="dom-if"
                  if="[[isNumber]]"
                  restamp="true">
                <paper-input
                    class="validate"
                    label="[[localize('label')]]"
                    on-input="_validate"
                    value="{{data.label}}"
                    disabled="[[!canEditDetails]]"
                    always-float-label>
                </paper-input>
              </template>

              <template
                  is="dom-if"
                  if="[[!isNumber]]"
                  restamp="true">
                <div class="app-grid">
                  <paper-input
                      class="item validate"
                      label="[[localize('numerator_label')]]"
                      on-input="_validate"
                      value="{{data.numerator_label}}"
                      disabled="[[!canEditDetails]]"
                      always-float-label>
                  </paper-input>

                  <paper-input
                      class="item validate"
                      label="[[localize('denominator_label')]]"
                      on-input="_validate"
                      value="{{data.denominator_label}}"
                      disabled="[[!canEditDetails]]"
                      always-float-label>
                  </paper-input>
                </div>
              </template>
            </div>

            <div class="row">
              <div class="app-grid">
                <json-field
                    class="item validate"
                    type="[[data.blueprint.display_type]]"
                    label="[[localize('baseline')]]"
                    on-input="_validate"
                    value="{{data.baseline}}"
                    allowed-pattern="[+\\-\\d]"
                    disabled="[[!canEditDetails]]">
                </json-field>

                <template
                    is="dom-if"
                    if="[[isNumber]]"
                    restamp="true">
                  <json-field
                      class="item validate"
                      type="[[data.blueprint.display_type]]"
                      label="[[localize('in_need')]]"
                      on-input="_validate"
                      value="{{data.in_need}}"
                      allowed-pattern="[+\\-\\d]"
                      disabled="[[!canEditDetails]]">
                  </json-field>
                </template>

                <json-field
                    class="item validate"
                    type="[[data.blueprint.display_type]]"
                    label="[[localize('target')]]"
                    on-input="_validate"
                    value="{{data.target}}"
                    allowed-pattern="[+\\-\\d]"
                    disabled="[[!canEditDetails]]"
                    disable-denominator
                    required>
                </json-field>
              </div>
            </div>

            <div class="row">
              <div class="row">
                <indicator-locations-widget
                    class="validate"
                    cluster-id="[[data.cluster]]"
                    indicator-id="[[data.id]]"
                    indicator-type="[[data.blueprint.display_type]]"
                    parent-indicator-id="[[data.parent_indicator]]"
                    is-pai="[[isPAI]]"
                    value="{{data.locations}}"
                    editing>
                </indicator-locations-widget>
              </div>
            </div>

            <div class="row">
              <disaggregations-dropdown-widget
                  value="{{data.disaggregations}}"
                  readonly>
              </disaggregations-dropdown-widget>
            </div>
          </template>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button
              on-tap="_save"
              class="btn-primary"
              raised>
            [[localize('save')]]
          </paper-button>

          <paper-button class="btn-cancel" on-tap="close">
            [[localize('cancel')]]
          </paper-button>
        </div>

        <etools-loading active="[[updatePending]]"></etools-loading>
      </paper-dialog>
    `;
    }
    static get observers() {
        return ['_setDefaults(opened)',
            '_updateCSDates(data.start_date_of_reporting_period)'];
    }
    _computeLocalizedFrequencies(frequencies, localize) {
        const self = this;
        return frequencies.map(function (frequency) {
            frequency.title = self._localizeLowerCased(frequency.title, localize);
            return frequency;
        });
    }
    _computeIndicatorType(data, localize) {
        if (!data) {
            return;
        }
        switch (data.blueprint.display_type) {
            case 'number':
                return localize('quantity');
            case 'percentage':
                return localize('percent');
            case 'ratio':
                return localize('ratio');
        }
    }
    _computeProjects(data) {
        if (this._computeIsPAI(data)) {
            this.set('data.project_context_id', data.object_id);
            return [{ context_id: data.object_id, project_name: data.content_object_title }];
        }
        else {
            return [];
        }
    }
    _computeIsNumber(type) {
        return type === 'number';
    }
    _computeCanEditDetails(permissions, data, isPAI) {
        if (!permissions || !data) {
            return;
        }
        return (permissions.createClusterEntities && !isPAI) ||
            (permissions.onlyEditOwnIndicatorDetails && !data.parent_indicator);
    }
    _computeIsPAI(data) {
        return (data.content_type_key || '').split('.').pop().toLowerCase() === 'partneractivityprojectcontext';
    }
    _computeMinDate(date) {
        return date ? this._normalizeDate(date) : null;
    }
    _setDefaults(opened) {
        if (!opened) {
            return;
        }
        this.set('data', Object.assign({
            cs_dates: []
        }, this._clone(this.get('editData'))));
        this.set('errors', {});
        this._fetchLocations();
    }
    _validate(e) {
        e.target.validate();
    }
    _showCSD(frequency) {
        return frequency && this._equals(frequency, 'Csd');
    }
    _computeLocationsUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.clusterLocationNames(responsePlanId);
    }
    _fetchLocations() {
        const self = this;
        const locThunk = this.$.locations.thunk();
        locThunk().then((res) => {
            self.set('locations', res.data);
        });
    }
    _updateCSDates(startDateStr) {
        if (!startDateStr) {
            return;
        }
        this.data.start_date_of_reporting_period = moment(this.data.start_date_of_reporting_period).format(Settings.datepickerFormat);
        const dates = this.get('data.cs_dates');
        const startDate = this._normalizeDate(startDateStr);
        this.set('data.cs_dates', dates && dates.filter((d) => {
            return this._normalizeDate(d) >= startDate;
        }, this));
    }
    _save() {
        const self = this;
        let noLocationSet = false;
        const rawLocations = this.get('data.locations') || [];
        const changedLocations = rawLocations.map(function (location) {
            if (location.location && location.location.id) {
                const id = location.location.id;
                location.location = id;
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
        this.set('updatePending', true);
        if (this.data.frequency !== 'Csd') {
            delete this.data.cs_dates;
        }
        this.set('data.object_type', this.editData.content_type_key);
        const editIndThunk = this.$.editIndicator.thunk();
        editIndThunk()
            .then((res) => {
            fireEvent(self, 'indicator-edited', res.data);
            self.set('updatePending', false);
            self.set('errors', {});
            self.close();
        })
            .catch((err) => {
            self.set('errors', err.data);
            self.set('data.locations', rawLocations);
            self.set('updatePending', false);
        });
    }
}
__decorate([
    property({ type: Object })
], IndicatorEditingModal.prototype, "editData", void 0);
__decorate([
    property({ type: Object })
], IndicatorEditingModal.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], IndicatorEditingModal.prototype, "permissions", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeIsNumber(data.blueprint.display_type)' })
], IndicatorEditingModal.prototype, "isNumber", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], IndicatorEditingModal.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String, computed: '_computeIndicatorType(data, localize)' })
], IndicatorEditingModal.prototype, "indicatorType", void 0);
__decorate([
    property({ type: String, computed: '_computeLocationsUrl(responsePlanId)' })
], IndicatorEditingModal.prototype, "locationsUrl", void 0);
__decorate([
    property({ type: String })
], IndicatorEditingModal.prototype, "indicatorsUrl", void 0);
__decorate([
    property({ type: Boolean })
], IndicatorEditingModal.prototype, "updatePending", void 0);
__decorate([
    property({ type: Array })
], IndicatorEditingModal.prototype, "locations", void 0);
__decorate([
    property({ type: Array, computed: '_computeProjects(data)' })
], IndicatorEditingModal.prototype, "projects", void 0);
__decorate([
    property({ type: Array })
], IndicatorEditingModal.prototype, "frequencies", void 0);
__decorate([
    property({ type: Array })
], IndicatorEditingModal.prototype, "disaggregations", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeIsPAI(data)' })
], IndicatorEditingModal.prototype, "isPAI", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeCanEditDetails(permissions, data, isPAI)' })
], IndicatorEditingModal.prototype, "canEditDetails", void 0);
__decorate([
    property({ type: String })
], IndicatorEditingModal.prototype, "dateFormat", void 0);
__decorate([
    property({ type: Object, computed: '_computeMinDate(data.start_date_of_reporting_period)' })
], IndicatorEditingModal.prototype, "_minDate", void 0);
window.customElements.define('indicator-edit-modal', IndicatorEditingModal);
