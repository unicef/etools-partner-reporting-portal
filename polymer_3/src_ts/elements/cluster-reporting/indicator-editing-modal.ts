import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
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
import {buttonsStyles} from '../../styles/buttons-styles';
import {modalStyles} from '../../styles/modal-styles';
import '../error-box';
import '../etools-prp-permissions';
import {GenericObject} from '../../typings/globals.types';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import {fireEvent} from '../../utils/fire-custom-event';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin NotificationsMixin
 * @appliesMixin LocalizeMixin
 */
class IndicatorEditingModal extends UtilsMixin(ModalMixin(LocalizeMixin(ReduxConnectedElement))) {
  public static get template() {
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
                <!--
                <etools-single-selection-menu
                  class="item validate pair"
                  label="[[localize('project_context')]]"
                  options="[[projects]]"
                  option-value="context_id"
                  option-label="project_name"
                  selected="{{data.project_context_id}}"
                  on-iron-activate="_validate"
                  trigger-value-change-event
                  hide-search
                  disabled
                  required>
                </etools-single-selection-menu>
                -->
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
                <!--
                <etools-single-selection-menu
                    class="item validate"
                    label="[[localize('frequency_of_reporting')]]"
                    options="[[_computeLocalizedFrequencies(frequencies, localize)]]"
                    option-value="id"
                    option-label="title"
                    selected="{{data.frequency}}"
                    on-iron-activate="_validate"
                    disabled="[[!canEditDetails]]"
                    trigger-value-change-event
                    hide-search
                    required>
                </etools-single-selection-menu>
                -->
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
                <!--
                <etools-prp-date-input
                    class="item validate"
                    label="[[localize('start_date_reporting')]]"
                    value="{{data.start_date_of_reporting_period}}"
                    disabled="[[!canEditDetails]]"
                    format="[[dateFormat]]"
                    error-message=""
                    no-init>
                </etools-prp-date-input>
                -->
                <datepicker-lite
                  class="item validate"
                  label="[[localize('start_date_reporting')]]"
                  value="{{data.start_date_of_reporting_period}}"
                  disabled="[[!canEditDetails]]"
                  error-message=""
                  selected-date-display-format="[[dateFormat]]">
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

          <paper-button
              on-tap="close">
            [[localize('cancel')]]
          </paper-button>
        </div>

        <etools-loading active="[[updatePending]]"></etools-loading>
      </paper-dialog>
    `;
  }

  @property({type: Object})
  editData!: GenericObject;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Boolean, computed: '_computeIsNumber(data.blueprint.display_type)'})
  isNumber!: boolean;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String, computed: '_computeIndicatorType(data, localize)'})
  indicatorType!: string;

  @property({type: String, computed: '_computeLocationsUrl(responsePlanId)'})
  locationsUrl!: string;

  @property({type: String})
  indicatorsUrl: string = Endpoints.clusterIndicators();

  @property({type: Boolean})
  updatePending: boolean = false;

  @property({type: Array})
  locations: any[] = [];

  @property({type: Array, computed: '_computeProjects(data)'})
  projects!: any[];

  @property({type: Array})
  frequencies: GenericObject[] = [
    {
      id: 'Wee',
      title: 'Weekly',
    },
    {
      id: 'Mon',
      title: 'Monthly',
    },
    {
      id: 'Qua',
      title: 'Quarterly',
    },
    {
      id: 'Csd',
      title: 'Custom specific dates',
    },
  ];

  @property({type: Array})
  disaggregations: any[] = [];

  @property({type: Boolean, computed: '_computeIsPAI(data)'})
  isPAI!: boolean;

  @property({type: Boolean, computed: '_computeCanEditDetails(permissions, data, isPAI)'})
  canEditDetails!: boolean;

  @property({type: String})
  dateFormat: string = Settings.dateFormat;

  @property({type: Object, computed: '_computeMinDate(data.start_date_of_reporting_period)'})
  _minDate!: GenericObject;


  static get observers() {
    return ['_setDefaults(opened)',
      '_updateCSDates(data.start_date_of_reporting_period)'];
  }

  _computeLocalizedFrequencies(frequencies: GenericObject[], localize: Function) {
    let self = this;

    return frequencies.map(function(frequency) {
      frequency.title = self._localizeLowerCased(frequency.title, localize);
      return frequency;
    });
  }

  _computeIndicatorType(data: GenericObject, localize: Function) {
    switch (data.blueprint.display_type) {
      case 'number':
        return localize('quantity');

      case 'percentage':
        return localize('percent');

      case 'ratio':
        return localize('ratio');
    }
  }

  _computeProjects(data: GenericObject) {
    if (this._computeIsPAI(data)) {
      this.set('data.project_context_id', data.object_id);
      return [{context_id: data.object_id, project_name: data.content_object_title}];
    } else {
      return [];
    }
  }

  _computeIsNumber(type: any) {
    return type === 'number';
  }

  _computeCanEditDetails(permissions: GenericObject, data: GenericObject, isPAI: boolean) {
    return (permissions.createClusterEntities && !isPAI) ||
      (permissions.onlyEditOwnIndicatorDetails && !data.parent_indicator);
  }

  _computeIsPAI(data: GenericObject) {
    return (data.content_type_key || '').split('.').pop().toLowerCase() === 'partneractivityprojectcontext';
  }

  _computeMinDate(date?: Date) {
    return date ? this._normalizeDate(date) : null;
  }

  _setDefaults(opened: boolean) {
    if (!opened) {
      return;
    }

    this.set('data', Object.assign({
      cs_dates: [],
    }, this._clone(this.get('editData'))));

    this.set('errors', {});

    this._fetchLocations();
  }

  _validate(e: CustomEvent) {
    (e.target as any).validate();
  }

  _showCSD(frequency: GenericObject) {
    return frequency && this._equals(frequency, 'Csd');
  }

  _computeLocationsUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterLocationNames(responsePlanId);
  }

  _fetchLocations() {
    let self = this;

    const locThunk = (this.$.locations as EtoolsPrpAjaxEl).thunk();
    locThunk().then((res: GenericObject) => {
      self.set('locations', res.data);
    });
  }

  _updateCSDates(startDateStr: string) {
    if (!startDateStr) {
      return;
    }

    let dates = this.get('data.cs_dates');
    let startDate = this._normalizeDate(startDateStr);

    this.set('data.cs_dates', dates && dates.filter((d: string) => {
      return this._normalizeDate(d) >= startDate;
    }, this));
  }

  _save() {
    let self = this;

    let noLocationSet = false;
    let rawLocations = this.get('data.locations');

    let changedLocations = rawLocations.map(function(location: GenericObject) {
      if (location.location !== undefined && location.location.id !== undefined) {
        let id = location.location.id;
        location.location = id;
        return location;
      } else if (location.loc_type !== undefined && location.location === undefined) {
        self.set('errors', 'No location set - please set a location.');
        noLocationSet = true;
        return location;
      } else {
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

    const editIndThunk = (this.$.editIndicator as EtoolsPrpAjaxEl).thunk();
    editIndThunk()
      .then((res: GenericObject) => {
        fireEvent(self, 'indicator-edited', res.data);
        self.set('updatePending', false);
        self.set('errors', {});
        self.close();
      })
      .catch((err: GenericObject) => {
        self.set('errors', err.data);
        self.set('data.locations', rawLocations);
        self.set('updatePending', false);
      });
  }
}

window.customElements.define('indicator-edit-modal', IndicatorEditingModal);
