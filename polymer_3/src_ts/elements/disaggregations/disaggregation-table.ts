import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {property} from '@polymer/decorators';
import {html} from '@polymer/polymer';
import '@polymer/paper-input/paper-input';
import './table-content/three-disaggregations';
import './table-content/two-disaggregations';
import './table-content/one-disaggregation';
import './table-content/zero-disaggregations';
import './disaggregation-switches';
import '../etools-prp-ajax';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import DisaggregationHelpersMixin from '../../mixins/disaggregation-helpers-mixin';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {GenericObject} from '../../typings/globals.types';
import Endpoints from '../../endpoints';
import {fireEvent} from '../../utils/fire-custom-event';
import {disaggregationsUpdateForLocation} from '../../redux/actions/disaggregations';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin DisaggregationHelpersMixin
 */
class DisaggregationTable extends LocalizeMixin(DisaggregationHelpersMixin(UtilsMixin(ReduxConnectedElement))) {
  public static get template() {
    return html`
      ${disaggregationTableStyles}
      <style>
        :host {
          --paper-input-container: {
            padding: 0;
          }
        }

        disaggregation-switches {
          margin-bottom: 1em;
        }

        .data-key {
          font-size: 12px;
          color: var(--theme-secondary-text-color);
        }

        .data-key dt,
        .data-key dd {
          display: inline;
        }

        .data-key dd {
          margin: 0;
        }

        h4 {
          font-size: 12px;
        }

        .percentage-map {
          padding-left: 25px;
        }

        .percentage-map ul {
          padding: 0;
          margin: 0;
          list-style: none;
          font-size: 13px;
        }

        .percentage-map li {
          margin-bottom: 5px;
        }

        .percentage-map paper-input {
          width: 60px;
          padding: 0;
          margin: 0 5px;
          text-align: center;
        }

        .percentage-map .entity-name {
          display: inline-block;
          padding: 3px 10px;
          white-space: nowrap;
          background-color: var(--paper-grey-100);
        }
      </style>

      <etools-prp-ajax
        id="update"
        url="[[updateUrl]]"
        body="[[localData]]"
        content-type="application/json"
        method="put"
      >
      </etools-prp-ajax>

      <div>
        <disaggregation-switches
          data="[[data]]"
          mapping="[[mapping]]"
          editable="[[editable]]"
          formatted-data="{{formattedData}}"
          on-formatted-data-changed="_triggerModalRefit"
        >
        </disaggregation-switches>

        <template is="dom-if" if="[[viewLabel]]" restamp="true">
          <template is="dom-if" if="[[labels]]" restamp="true">
            <dl class="data-key">
              <dt>[[localize('label')]] -</dt>
              <template is="dom-if" if="[[_equals(data.display_type, 'number')]]" restamp="true">
                <dd>[[_withDefault(labels.label)]]</dd>
              </template>
              <template is="dom-if" if="[[!_equals(data.display_type, 'number')]]" restamp="true">
                <dd>
                  [[_withDefault(labels.numerator_label)]] / [[_withDefault(labels.denominator_label)]]
                </dd>
              </template>
            </dl>
          </template>
        </template>

        <div class="layout horizontal justified">
          <div class="flex">
            <template is="dom-if" if="[[dualReportingEnabled]]" restamp="true">
              <h4>[[localize('progress_against_cluster_target')]]:</h4>
            </template>

            <table class="vertical layout">
              <template is="dom-if" if="[[_equals(formattedMapping.length, 0)]]" restamp="true">
                <zero-disaggregations data="[[viewData]]" mapping="[[formattedMapping]]" editable="[[editable]]">
                </zero-disaggregations>
              </template>

              <template is="dom-if" if="[[_equals(formattedMapping.length, 1)]]" restamp="true">
                <one-disaggregation data="[[viewData]]" mapping="[[formattedMapping]]" editable="[[editable]]">
                </one-disaggregation>
              </template>

              <template is="dom-if" if="[[_equals(formattedMapping.length, 2)]]" restamp="true">
                <two-disaggregations data="[[viewData]]" mapping="[[formattedMapping]]" editable="[[editable]]">
                </two-disaggregations>
              </template>

              <template is="dom-if" if="[[_equals(formattedMapping.length, 3)]]" restamp="true">
                <three-disaggregations data="[[viewData]]" mapping="[[formattedMapping]]" editable="[[editable]]">
                </three-disaggregations>
              </template>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  labels!: GenericObject;

  @property({type: Object})
  totals!: GenericObject;

  @property({type: Array})
  byEntity: any[] = [];

  @property({type: Number})
  editable = 0;

  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  app!: string;

  @property({type: Object, observer: '_cloneData'})
  formattedData!: GenericObject;

  @property({type: Array, computed: '_computeMapping(editableBool, formattedData, mapping)'})
  formattedMapping!: any[];

  @property({type: Object, computed: '_computeViewData(formattedData, totals)'})
  viewData!: GenericObject;

  @property({type: String})
  updateUrl: string = Endpoints.indicatorLocationDataEntries();

  @property({type: Boolean, computed: '_computeEditableBool(editable)'})
  editableBool!: boolean;

  @property({type: String, computed: '_computeIndicatorType(data)'})
  indicatorType!: string;

  @property({type: Boolean, computed: '_computeLabelVisibility(app, indicatorType)'})
  viewLabel!: boolean;

  @property({type: Boolean, computed: '_computeDualReportingEnabled(byEntity, editableBool)'})
  dualReportingEnabled!: boolean;

  @property({type: Array, computed: '_computeReportingEntityPercentageMap(byEntity)'})
  reportingEntityPercentageMap!: any[];

  @property({type: Array})
  fields!: any[];

  @property({type: Object})
  localData!: GenericObject;

  @property({type: Array})
  mapping!: any[];

  @property({type: Number})
  indicatorId!: number;

  static get observers() {
    return [
      '_resetFields(formattedData.disaggregation_reported_on)',
      '_initPercentageMap(localData, reportingEntityPercentageMap)'
    ];
  }

  _registerField(e: CustomEvent) {
    e.stopPropagation();

    if (!this.fields) {
      this.set('fields', []);
    }

    this.push('fields', e.detail);
  }

  _fieldValueChanged(e: CustomEvent) {
    const key = e.detail.key;
    if (!key) {
      return;
    }
    const value = e.detail.value;
    let totals;

    const newValue = Object.assign(
      {
        c: null,
        d: null,
        v: null
      },
      this.get(['localData.disaggregation', key]),
      value
    );

    e.stopPropagation();

    this.set(['localData.disaggregation', key], newValue);
    this.set(['totals', key], newValue);

    switch (this.formattedData.level_reported) {
      case 1:
      case 2:
      case 3:
        totals = Object.assign(
          {},
          this.totals,
          // @ts-ignore
          this['_calculateLevel' + this.formattedData.level_reported](key, this.totals)
        );
        break;

      default:
        // For zero disaggregated data reporting, re-assign updated component totals
        // with local copy of totals.
        // Otherwise component totals get overwritten
        // by undefined local copy of totals
        totals = this.get(['totals']);
        break;
    }

    // Re-saving disaggregation data after total calculations
    // since totals contains entire disaggregation keyspace set
    // delete wrong generated keys (on _calculateLevel3)
    delete totals['(,)'];
    this.set(['localData.disaggregation'], totals);

    if (totals) {
      this.set('totals', totals);
    }
  }

  _cloneData(formattedData: GenericObject) {
    if (!this.editableBool) {
      return;
    }

    this.set('localData', this._clone(formattedData));
    this.set('totals', this._clone(formattedData.disaggregation));
  }

  _resetFields() {
    this.set('fields', []);
  }

  _computeEditableBool(editable: number) {
    return editable === 1;
  }

  _computeLabelVisibility(app: string, indicatorType: string) {
    if (String(app) === 'ip-reporting' && String(indicatorType) === 'number') {
      return false;
    } else {
      return true;
    }
  }

  save() {
    if (!this.editable) {
      return Promise.reject();
    }

    this.fields.forEach(function (field) {
      field.validate();
    });

    const cellsValid = this.fields.every(function (field) {
      return !field.invalid;
    });

    const percentagesValid = this._fieldsAreValid();

    if (!cellsValid || !percentagesValid) {
      return Promise.reject();
    }

    const updateThunk = (this.shadowRoot!.querySelector('#update') as EtoolsPrpAjaxEl).thunk();
    (this.shadowRoot!.querySelector('#update') as EtoolsPrpAjaxEl).abort();

    return (
      this.reduxStore
        .dispatch(
          disaggregationsUpdateForLocation(updateThunk, String(this.indicatorId), this.formattedData.location.id)
        )
        // @ts-ignore
        .then((value) => {
          fireEvent(this, 'locations-updated');
          return value;
        })
    );
  }

  _triggerModalRefit(e: CustomEvent) {
    e.stopPropagation();

    if (!this.editableBool) {
      return;
    }

    fireEvent(this, 'disaggregation-modal-refit');
  }

  _computeMapping(editableBool: boolean, formattedData: GenericObject, mapping: any[]) {
    if (!formattedData) {
      return;
    }

    const reportedOn = formattedData.disaggregation_reported_on;

    return editableBool
      ? mapping.filter(function (disagg) {
          return reportedOn.indexOf(disagg.id) !== -1;
        })
      : mapping;
  }

  _computeIndicatorType(data: GenericObject) {
    return data.display_type;
  }

  _computeViewData(data: GenericObject, totals: GenericObject) {
    return Object.assign({}, data, {
      disaggregation: Object.assign({}, data.disaggregation, totals)
    });
  }

  _computeDualReportingEnabled(byEntity: any[], editableBool: boolean) {
    return byEntity.length > 1 && editableBool;
  }

  _computeReportingEntityPercentageMap(byEntity: any[]) {
    return byEntity
      .filter(function (location) {
        return !location.is_master_location_data;
      })
      .map(function (location) {
        return {
          title: location.reporting_entity.title,
          percentage: 1
        };
      });
  }

  // @ts-ignore
  _initPercentageMap(localData: GenericObject, map: any[]) {
    if (!map.length) {
      return;
    }

    this.set('localData.reporting_entity_percentage_map', map);
  }

  _formatPercentage(value: number) {
    return value * 100;
  }

  _parsePercentage(percentage: string) {
    return Number(percentage) / 100;
  }

  _handleInput(e: CustomEvent) {
    const input = e.target as any;

    input.validate();

    this.set(
      ['localData.reporting_entity_percentage_map', input.dataset.index, 'percentage'],
      this._parsePercentage(input.value)
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
    if (!this.totals) {
      this.set('totals', {});
    }
  }

  _addEventListeners() {
    if (this.editableBool) {
      this._registerField = this._registerField.bind(this);
      this.addEventListener('register-field', this._registerField as any);
      this._fieldValueChanged = this._fieldValueChanged.bind(this);
      this.addEventListener('field-value-changed', this._fieldValueChanged as any);
    }
  }

  _removeEventListeners() {
    if (this.editableBool) {
      this.removeEventListener('register-field', this._registerField as any);
      this.removeEventListener('field-value-changed', this._fieldValueChanged as any);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }
}

window.customElements.define('disaggregation-table', DisaggregationTable);

export {DisaggregationTable as DisaggregationTableEl};
