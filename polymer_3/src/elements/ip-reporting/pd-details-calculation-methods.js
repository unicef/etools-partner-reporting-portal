var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-radio-group/paper-radio-group';
import '@polymer/paper-radio-button/paper-radio-button';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-data-table/etools-data-table';
import Constants from '../../etools-prp-common/constants';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import { pdIndicatorsAll, pdIndicatorsLoading } from '../../redux/selectors/programmeDocumentIndicators';
import DataTableMixin from '../../etools-prp-common/mixins/data-table-mixin';
import NotificationsMixin from '../../etools-prp-common/mixins/notifications-mixin';
import { pdIndicatorsFetch, pdIndicatorsUpdate } from '../../redux/actions/pdIndicators';
import { pdFetch } from '../../redux/actions/pd';
import '../../etools-prp-common/elements/etools-prp-ajax';
import '../../etools-prp-common/elements/page-body';
import '../../etools-prp-common/elements/etools-prp-permissions';
import '../../etools-prp-common/elements/confirm-box';
import '../../etools-prp-common/elements/calculation-methods-info-bar';
import { tableStyles } from '../../etools-prp-common/styles/table-styles';
import { buttonsStyles } from '../../etools-prp-common/styles/buttons-styles';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import Endpoints from '../../endpoints';
import { computeIndicatorsUrl, computeFormattedData, computeSelected, computeDisabled, onValueChanged, canEdit, canSave } from './js/pd-details-calculation-methods-functions';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin DataTableMixin
 * @appliesMixin NotificationsMixin
 */
class PdDetailsCalculationMethods extends LocalizeMixin(NotificationsMixin(DataTableMixin(UtilsMixin(ReduxConnectedElement)))) {
    static get template() {
        return html `
      ${buttonsStyles} ${tableStyles}
      <style include="data-table-styles iron-flex iron-flex-reverse">
        :host {
          display: block;

          --data-table-header: {
            height: auto;
          }

          --header-title: {
            display: none;
          }
        }

        .wrapper {
          min-height: 80px;
          position: relative;
        }

        .pd-output {
          --list-bg-color: var(--paper-grey-200);

          font-weight: bold;
        }

        paper-radio-button {
          padding: 0 !important;
        }

        paper-radio-button:not(:first-child) {
          margin-left: 12px;
        }

        .buttons {
          margin: 1em 0;
        }
      </style>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <etools-prp-ajax id="programmeDocuments" url="[[programmeDocumentsUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="indicators" url="[[indicatorsUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax
        id="update"
        method="post"
        url="[[indicatorsUrl]]"
        body="[[localData]]"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <page-body>
        <calculation-methods-info-bar></calculation-methods-info-bar>
        <etools-data-table-header no-collapse>
          <etools-data-table-column>
            <div class="table-column">[[localize('indicators_for_pd')]]</div>
          </etools-data-table-column>
          <etools-data-table-column>
            <div class="table-column">[[localize('calculation_method_across_locations')]]</div>
          </etools-data-table-column>
          <etools-data-table-column>
            <div class="table-column">[[localize('calculation_method_across_reporting')]]</div>
          </etools-data-table-column>
        </etools-data-table-header>

        <div class="wrapper">
          <template is="dom-repeat" items="[[formattedData]]" initial-count="[[pageSize]]">
            <template is="dom-if" if="[[_equals(item.type, 'label')]]" restamp="true">
              <etools-data-table-row class="pd-output" no-collapse>
                <div slot="row-data">
                  <div class="table-cell table-cell--text">[[item.text]]</div>
                </div>
              </etools-data-table-row>
            </template>

            <template is="dom-if" if="[[_equals(item.type, 'data')]]" restamp="true">
              <etools-data-table-row no-collapse>
                <div slot="row-data">
                  <div class="table-cell">[[item.data.title]]</div>
                  <div class="table-cell">
                    <template is="dom-if" if="[[_canEdit(item, permissions)]]">
                      <paper-radio-group
                        data-id$="[[item.data.id]]"
                        data-llo-id$="[[item.llo_id]]"
                        data-scope="calculation_formula_across_locations"
                        on-paper-radio-group-changed="_onValueChanged"
                        selected="[[_computeSelected(item.data, 'calculation_formula_across_locations')]]"
                      >
                        <paper-radio-button name="sum" disabled="[[_computeDisabled(item.data.display_type)]]">
                          [[localize('sum')]]
                        </paper-radio-button>
                        <paper-radio-button name="max" disabled="[[_computeDisabled(item.data.display_type)]]">
                          [[localize('max')]]
                        </paper-radio-button>
                        <paper-radio-button name="avg" disabled="[[_computeDisabled(item.data.display_type)]]">
                          [[localize('avg')]]
                        </paper-radio-button>
                      </paper-radio-group>
                    </template>
                    <template is="dom-if" if="[[!_canEdit(item, permissions)]]">
                      [[item.data.calculation_formula_across_locations]]
                    </template>
                  </div>
                  <div class="table-cell">
                    <template is="dom-if" if="[[_canEdit(item, permissions)]]">
                      <paper-radio-group
                        data-id$="[[item.data.id]]"
                        data-llo-id$="[[item.llo_id]]"
                        data-scope="calculation_formula_across_periods"
                        on-paper-radio-group-changed="_onValueChanged"
                        selected="[[_computeSelected(item.data, 'calculation_formula_across_periods')]]"
                        disabled="[[_computeDisabled(item.data)]]"
                      >
                        <paper-radio-button name="sum" disabled="[[_computeDisabled(item.data.display_type)]]">
                          [[localize('sum')]]
                        </paper-radio-button>
                        <paper-radio-button name="max" disabled="[[_computeDisabled(item.data.display_type)]]">
                          [[localize('max')]]
                        </paper-radio-button>
                        <paper-radio-button name="avg" disabled="[[_computeDisabled(item.data.display_type)]]">
                          [[localize('avg')]]
                        </paper-radio-button>
                      </paper-radio-group>
                    </template>
                    <template is="dom-if" if="[[!_canEdit(item, permissions)]]">
                      [[item.data.calculation_formula_across_periods]]
                    </template>
                  </div>
                </div>
              </etools-data-table-row>
            </template>
          </template>

          <etools-loading active="[[loading]]"></etools-loading>
        </div>

        <template is="dom-if" if="[[_canSave(permissions)]]" restamp="true">
          <div class="buttons layout horizontal-reverse">
            <paper-button on-tap="_save" class="btn-primary" disabled="[[loading]]" raised>
              [[localize('save')]]
            </paper-button>
          </div>
        </template>
      </page-body>

      <confirm-box id="confirm"></confirm-box>
    `;
    }
    _initLocalData(data) {
        this.set('localData', this._clone(data));
    }
    _computeIndicatorsUrl(locationId, pdId) {
        return computeIndicatorsUrl(locationId, pdId);
    }
    _pdIndicatorsAll(rootState) {
        return pdIndicatorsAll(rootState);
    }
    _pdIndicatorsLoading(rootState) {
        return pdIndicatorsLoading(rootState);
    }
    _computeProgrammeDocumentsUrl(locationId) {
        return locationId ? Endpoints.programmeDocuments(locationId) : '';
    }
    _computeFormattedData(data) {
        return computeFormattedData(data);
    }
    _computeSelected(data, scope) {
        return computeSelected(data, scope);
    }
    _computeDisabled(display_type) {
        return computeDisabled(display_type);
    }
    _fetchData(url) {
        if (!url || !this.pdId) {
            return;
        }
        this._fetchDataDebouncer = Debouncer.debounce(this._fetchDataDebouncer, timeOut.after(250), () => {
            var indicatorsThunk = this.$.indicators.thunk();
            this.$.indicators.abort();
            this.reduxStore
                .dispatch(pdIndicatorsFetch(indicatorsThunk, this.pdId))
                // @ts-ignore
                .catch(function (err) {
                console.log(err);
            });
        });
    }
    _onValueChanged(e) {
        const newValue = e.target.selected;
        const data = e.target.dataset;
        const indices = onValueChanged(data, this.localData);
        this.set(['localData.ll_outputs_and_indicators', indices.lloIndex, 'indicators', indices.indicatorIndex, data.scope], newValue);
    }
    _save() {
        this._confirmIntent()
            .then(() => {
            const updateThunk = this.$.update.thunk();
            return this.reduxStore.dispatch(pdIndicatorsUpdate(updateThunk, this.pdId));
        })
            .then(this._notifyChangesSaved.bind(this))
            .catch((_err) => {
            console.log(_err);
        });
    }
    _confirmIntent() {
        const deferred = this._deferred();
        this.$.confirm.run({
            body: 'Please make sure the calculation methods for your indicators are ' +
                'properly configured. Changing calculation methods would recalculate ' +
                'progress reports for your indicators!',
            result: deferred,
            maxWidth: '500px',
            // where to find it?
            mode: Constants.CONFIRM_MODAL
        });
        return deferred.promise;
    }
    _canEdit(item, permissions) {
        return canEdit(item, permissions);
    }
    _canSave(permissions) {
        return canSave(permissions);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.$.indicators.abort();
        if (this._debouncer && this._debouncer.isActive()) {
            this._debouncer.cancel();
        }
    }
    _getPdReports() {
        // Status being present prevents Redux / res.data from getting reports,
        // preventing pd-details title from rendering. In that case (which we
        // check by seeing if this.pdReportsCount is present), just get the reports again
        if (this.pdReportsCount[this.pdId] === undefined) {
            this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
                const pdThunk = this.$.programmeDocuments;
                pdThunk.params = {
                    page: 1,
                    page_size: 10,
                    programme_document: this.pdId
                };
                // Cancel the pending request, if any
                this.$.programmeDocuments.abort();
                this.reduxStore
                    .dispatch(pdFetch(pdThunk.thunk()))
                    // @ts-ignore
                    .catch((_err) => {
                    //   // TODO: error handling
                });
            });
        }
    }
}
__decorate([
    property({ type: Object })
], PdDetailsCalculationMethods.prototype, "localData", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PdDetailsCalculationMethods.prototype, "locationId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)' })
], PdDetailsCalculationMethods.prototype, "pdId", void 0);
__decorate([
    property({ type: Boolean, computed: '_pdIndicatorsLoading(rootState)' })
], PdDetailsCalculationMethods.prototype, "loading", void 0);
__decorate([
    property({ type: Array, computed: '_pdIndicatorsAll(rootState)', observer: '_initLocalData' })
], PdDetailsCalculationMethods.prototype, "data", void 0);
__decorate([
    property({ type: Array, computed: '_computeFormattedData(data)' })
], PdDetailsCalculationMethods.prototype, "formattedData", void 0);
__decorate([
    property({ type: String, computed: '_computeIndicatorsUrl(locationId, pdId)', observer: '_fetchData' })
], PdDetailsCalculationMethods.prototype, "indicatorsUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeProgrammeDocumentsUrl(locationId)' })
], PdDetailsCalculationMethods.prototype, "programmeDocumentsUrl", void 0);
__decorate([
    property({
        type: Object,
        computed: 'getReduxStateValue(rootState.programmeDocumentReports.countByPD)',
        observer: '_getPdReports'
    })
], PdDetailsCalculationMethods.prototype, "pdReportsCount", void 0);
window.customElements.define('pd-details-calculation-methods', PdDetailsCalculationMethods);
