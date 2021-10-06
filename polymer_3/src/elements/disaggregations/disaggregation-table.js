var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { property } from '@polymer/decorators';
import { html } from '@polymer/polymer';
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
import { disaggregationTableStyles } from '../../styles/disaggregation-table-styles';
import Endpoints from '../../endpoints';
import { fireEvent } from '../../utils/fire-custom-event';
import { disaggregationsUpdateForLocation } from '../../redux/actions/disaggregations';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin DisaggregationHelpersMixin
 */
class DisaggregationTable extends LocalizeMixin(DisaggregationHelpersMixin(UtilsMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.byEntity = [];
        this.editable = 0;
        this.updateUrl = Endpoints.indicatorLocationDataEntries();
    }
    static get template() {
        return html `
      ${disaggregationTableStyles}
      <style>
        :host {
          --paper-input-container: {
            padding: 0;
          };
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
          background-color: var(--paper-grey-100)
        }
      </style>

      <etools-prp-ajax
          id="update"
          url="[[updateUrl]]"
          body="[[localData]]"
          content-type="application/json"
          method="put">
      </etools-prp-ajax>

      <div>
        <disaggregation-switches
            data="[[data]]"
            mapping="[[mapping]]"
            editable="[[editable]]"
            formatted-data="{{formattedData}}"
            on-formatted-data-changed="_triggerModalRefit">
        </disaggregation-switches>

        <template
            is="dom-if"
            if="[[viewLabel]]"
            restamp="true">
            <template
                is="dom-if"
                if="[[labels]]"
                restamp="true">
                <dl class="data-key">
                  <dt>[[localize('label')]] -</dt>
                  <template
                      is="dom-if"
                      if="[[_equals(data.display_type, 'number')]]"
                      restamp="true">
                    <dd>[[_withDefault(labels.label)]]</dd>
                  </template>
                  <template
                      is="dom-if"
                      if="[[!_equals(data.display_type, 'number')]]"
                      restamp="true">
                    <dd>
                      [[_withDefault(labels.numerator_label)]]
                      /
                      [[_withDefault(labels.denominator_label)]]
                    </dd>
                  </template>
                </dl>
            </template>
        </template>

        <div class="layout horizontal justified">
          <div class="flex">
            <template
                is="dom-if"
                if="[[dualReportingEnabled]]"
                restamp="true">
              <h4>[[localize('progress_against_cluster_target')]]:</h4>
            </template>

            <table class="vertical layout">
              <template
                  is="dom-if"
                  if="[[_equals(formattedMapping.length, 0)]]"
                  restamp="true">
                <zero-disaggregations
                    data="[[viewData]]"
                    mapping="[[formattedMapping]]"
                    editable="[[editable]]">
                </zero-disaggregations>
              </template>

              <template
                  is="dom-if"
                  if="[[_equals(formattedMapping.length, 1)]]"
                  restamp="true">
                <one-disaggregation
                    data="[[viewData]]"
                    mapping="[[formattedMapping]]"
                    editable="[[editable]]">
                </one-disaggregation>
              </template>

              <template
                  is="dom-if"
                  if="[[_equals(formattedMapping.length, 2)]]"
                  restamp="true">
                <two-disaggregations
                    data="[[viewData]]"
                    mapping="[[formattedMapping]]"
                    editable="[[editable]]">
                </two-disaggregations>
              </template>

              <template
                  is="dom-if"
                  if="[[_equals(formattedMapping.length, 3)]]"
                  restamp="true">
                <three-disaggregations
                    data="[[viewData]]"
                    mapping="[[formattedMapping]]"
                    editable="[[editable]]">
                </three-disaggregations>
              </template>
            </table>
          </div>
        </div>
      </div>
    `;
    }
    static get observers() {
        return ['_resetFields(formattedData.disaggregation_reported_on)',
            '_initPercentageMap(localData, reportingEntityPercentageMap)'];
    }
    _registerField(e) {
        e.stopPropagation();
        if (!this.fields) {
            this.set('fields', []);
        }
        this.push('fields', e.detail);
    }
    _fieldValueChanged(e) {
        const key = e.detail.key;
        if (!key) {
            return;
        }
        const value = e.detail.value;
        let totals;
        const newValue = Object.assign({
            c: null,
            d: null,
            v: null
        }, this.get(['localData.disaggregation', key]), value);
        e.stopPropagation();
        this.set(['localData.disaggregation', key], newValue);
        this.set(['totals', key], newValue);
        switch (this.formattedData.level_reported) {
            case 1:
            case 2:
            case 3:
                totals = Object.assign({}, this.totals, this['_calculateLevel' + this.formattedData.level_reported](key, this.totals));
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
    _cloneData(formattedData) {
        if (!this.editableBool) {
            return;
        }
        this.set('localData', this._clone(formattedData));
        this.set('totals', this._clone(formattedData.disaggregation));
    }
    _resetFields() {
        this.set('fields', []);
    }
    _computeEditableBool(editable) {
        return editable === 1;
    }
    _computeLabelVisibility(app, indicatorType) {
        if ((String(app) === 'ip-reporting') &&
            (String(indicatorType) === 'number')) {
            return false;
        }
        else {
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
        const self = this;
        const updateThunk = this.shadowRoot.querySelector('#update').thunk();
        this.shadowRoot.querySelector('#update').abort();
        return this.reduxStore.dispatch(disaggregationsUpdateForLocation(updateThunk, String(self.indicatorId), self.formattedData.location.id))
            // @ts-ignore
            .then(function (value) {
            fireEvent(self, 'locations-updated');
            return value;
        });
    }
    _triggerModalRefit(e) {
        e.stopPropagation();
        if (!this.editableBool) {
            return;
        }
        fireEvent(this, 'disaggregation-modal-refit');
    }
    _computeMapping(editableBool, formattedData, mapping) {
        if (!formattedData) {
            return;
        }
        const reportedOn = formattedData.disaggregation_reported_on;
        return editableBool ? mapping.filter(function (disagg) {
            return reportedOn.indexOf(disagg.id) !== -1;
        }) : mapping;
    }
    _computeIndicatorType(data) {
        return data.display_type;
    }
    _computeViewData(data, totals) {
        return Object.assign({}, data, {
            disaggregation: Object.assign({}, data.disaggregation, totals),
        });
    }
    _computeDualReportingEnabled(byEntity, editableBool) {
        return byEntity.length > 1 && editableBool;
    }
    _computeReportingEntityPercentageMap(byEntity) {
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
    _initPercentageMap(localData, map) {
        if (!map.length) {
            return;
        }
        this.set('localData.reporting_entity_percentage_map', map);
    }
    _formatPercentage(value) {
        return value * 100;
    }
    _parsePercentage(percentage) {
        return Number(percentage) / 100;
    }
    _handleInput(e) {
        const input = e.target;
        input.validate();
        this.set([
            'localData.reporting_entity_percentage_map',
            input.dataset.index,
            'percentage'
        ], this._parsePercentage(input.value));
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
            this.addEventListener('register-field', this._registerField);
            this._fieldValueChanged = this._fieldValueChanged.bind(this);
            this.addEventListener('field-value-changed', this._fieldValueChanged);
        }
    }
    _removeEventListeners() {
        if (this.editableBool) {
            this.removeEventListener('register-field', this._registerField);
            this.removeEventListener('field-value-changed', this._fieldValueChanged);
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: Object })
], DisaggregationTable.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], DisaggregationTable.prototype, "labels", void 0);
__decorate([
    property({ type: Object })
], DisaggregationTable.prototype, "totals", void 0);
__decorate([
    property({ type: Array })
], DisaggregationTable.prototype, "byEntity", void 0);
__decorate([
    property({ type: Number })
], DisaggregationTable.prototype, "editable", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.app.current)' })
], DisaggregationTable.prototype, "app", void 0);
__decorate([
    property({ type: Object, observer: '_cloneData' })
], DisaggregationTable.prototype, "formattedData", void 0);
__decorate([
    property({ type: Array, computed: '_computeMapping(editableBool, formattedData, mapping)' })
], DisaggregationTable.prototype, "formattedMapping", void 0);
__decorate([
    property({ type: Object, computed: '_computeViewData(formattedData, totals)' })
], DisaggregationTable.prototype, "viewData", void 0);
__decorate([
    property({ type: String })
], DisaggregationTable.prototype, "updateUrl", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeEditableBool(editable)' })
], DisaggregationTable.prototype, "editableBool", void 0);
__decorate([
    property({ type: String, computed: '_computeIndicatorType(data)' })
], DisaggregationTable.prototype, "indicatorType", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeLabelVisibility(app, indicatorType)' })
], DisaggregationTable.prototype, "viewLabel", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeDualReportingEnabled(byEntity, editableBool)' })
], DisaggregationTable.prototype, "dualReportingEnabled", void 0);
__decorate([
    property({ type: Array, computed: '_computeReportingEntityPercentageMap(byEntity)' })
], DisaggregationTable.prototype, "reportingEntityPercentageMap", void 0);
__decorate([
    property({ type: Array })
], DisaggregationTable.prototype, "fields", void 0);
__decorate([
    property({ type: Object })
], DisaggregationTable.prototype, "localData", void 0);
__decorate([
    property({ type: Array })
], DisaggregationTable.prototype, "mapping", void 0);
__decorate([
    property({ type: Number })
], DisaggregationTable.prototype, "indicatorId", void 0);
window.customElements.define('disaggregation-table', DisaggregationTable);
export { DisaggregationTable as DisaggregationTableEl };
