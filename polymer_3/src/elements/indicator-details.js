var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/maps-icons';
import '@polymer/paper-button/paper-button';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import '../utils/fire-custom-event';
import './etools-prp-ajax';
import './etools-prp-number';
import './status-badge';
import './etools-prp-printer';
import '../elements/disaggregations/disaggregation-table';
import '../elements/disaggregations/disaggregation-modal';
import './report-status';
import './pull-modal';
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import { fireEvent } from '../utils/fire-custom-event';
import Endpoints from '../endpoints';
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import { buttonsStyles } from '../styles/buttons-styles';
import { disaggregationsFetch } from '../redux/actions/disaggregations';
import { currentProgrammeDocument } from '../redux/selectors/programmeDocuments';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class IndicatorDetails extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.dataLoaded = false;
        this.loading = true;
        this.selected = 0;
        this.initialized = false;
        this.mode = '';
        this.overrideMode = '';
    }
    static get template() {
        return html `
    ${buttonsStyles}
    <style include="iron-flex iron-flex-alignment app-grid-style">
      :host {
        display: block;
        width: 100%;
        min-height: 150px;
        position: relative;

        --app-grid-columns: 2;
        --app-grid-gutter: 25px;
        --app-grid-item-height: auto;

        --paper-tabs: {
          padding-left: 12px;
          border-bottom: 1px solid var(--paper-grey-300);
        };
      }

      .header {
        padding: 20px 75px 0 25px;
        position: relative;
        height: 40px;
      }

      .locations-heading {
        margin: 0;
        font-size: 12px;
      }

      .print-btn {
        position: absolute;
        right: 15px;
        top: 9px;
      }

      .tab-header {
        padding: 10px 25px;
        border-bottom: 1px solid var(--paper-grey-300);
        background: var(--paper-grey-100);
      }

      .tab-header paper-button {
        margin: 0;
      }

      .table-container {
        max-height: 500px;
        padding-bottom: 25px;
        overflow: inherit;
      }

      .table-container dl {
        margin: 0;
        font-size: 12px;
        color: var(--theme-secondary-text-color);
      }

      .table-container dt,
      .table-container dd {
        display: inline;
        margin: 0;
      }

      .table-container dt:first-of-type,
      .table-container dd:first-of-type {
        font-weight: bold;
      }

      .table-container dd::after {
        content: '\\A';
	      white-space: pre;
      }

      #tabs-pages-container {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-direction: row;

        height: 360px;
      }

      #tabs-list-container {
        width: 30%;
        height: inherit;
      }

      #tabs-list {
        padding: 0;
        height: 300px; /* 360px - 60px */
        overflow: auto;
      }
      #tabs-list #tab-item {
        padding-left: 10%;
        min-height: 56px;
        padding: 0px 16px;
      }

      #tabs-list #tab-item.iron-selected {
        background-color: var(--theme-secondary-color-d);
      }

      #pages-container {
        width: 70%;
        height: inherit;
      }

      #reporting-tabs-list {
        display: flex;
        justify-content: center;
        border-bottom: 1px solid #e0e0e0;
      }

      #reporting-tabs-container {
        text-align: center;
        border-bottom: none;
      }

      #page-view-container {
        height: 250px; /* 360px - 110px */
        overflow: auto;
      }

      .location {
        margin: 0;
        font-weight: bold;
      }

      .location iron-icon {
        margin-left: -3px;
        color: var(--theme-primary-color);
      }

      .current-pd {
        margin: 0;
        font-size: 12px;
        color: var(--theme-primary-text-color-medium);
      }

      .location-progress {
        margin: 0;
        white-space: nowrap;
      }

      .location-progress dt,
      .location-progress dd {
        display: inline;
        margin: 0;
      }

      .location-progress dt {
        font-weight: bold;
      }

      disaggregation-modal disaggregation-table {
        margin-top: 1em;
      }
    </style>

    <etools-prp-ajax
        id="disaggregations"
        url="[[disaggregationsUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <template is="dom-if" if="[[dataLoaded]]">
      <div>
        <template
            is="dom-if"
            if="[[isHfIndicator]]">
          <div class="tab-header layout horizontal justified">
            <div class="self-center">[[localize('for_this_indicator')]]</div>
            <div>
              <paper-button
                  class="btn-primary"
                  modal-index="[[indicatorId]]"
                  on-tap="_openPullModal" disabled="[[disablePull]]">
                [[localize('pull_data')]]
              </paper-button>
            </div>
          </div>
        </template>
      </div>

      <etools-prp-printer selector=".printme">

        <div id="tabs-pages-container">
          <div id="tabs-list-container">
            <div class="tabs-header-container">
              <div class="header">
                <h3 class="locations-heading">[[localize('data_for_locations')]]</h3>

                <paper-icon-button
                    class="print-btn"
                    icon="icons:print">
                </paper-icon-button>
              </div>

              <div hidden aria-hidden="true">
                <template
                    is="dom-if"
                    if="[[currentPd.title]]">
                  <dl class="printme" style="margin: 0;">
                    <dt style="display: inline;">[[_singularLocalized('programme_documents', localize)]]:</dt>
                    <dd style="display: inline; margin: 0;">[[currentPd.title]]</dd>
                  </dl>
                </template>

                <template
                    is="dom-if"
                    if="[[indicatorName]]">
                  <dl class="printme" style="margin: 0;">
                    <dt style="display: inline;">[[localize('indicator')]]:</dt>
                    <dd style="display: inline; margin: 0;">[[indicatorName]]</dd>
                  </dl>
                </template>

                <template
                    is="dom-if"
                    if="[[indicatorStatus]]">
                  <span class="printme" style="margin-right: .5em;">[[localize('indicator_status')]]:</span>
                  <report-status
                      class="printme"
                      status="[[indicatorStatus]]"
                      report-type="[[reportType]]">
                  </report-status>
                </template>

                <div class="printme" style="margin-bottom: 2em;"></div>
              </div>
            </div>

            <paper-listbox
                selected="{{selected}}"
                id="tabs-list">
              <template
                  is="dom-repeat"
                  items="[[locationData]]"
                  as="topLevelLocation"
                  on-rendered-item-count-changed="onLocationRendered">
                <paper-item id="tab-item">
                  <status-badge type="[[_computeLocationStatus(topLevelLocation)]]"></status-badge>
                  [[topLevelLocation.title]]
                </paper-item>
              </template>
            </paper-listbox>
          </div>

          <iron-pages selected="{{selected}}" id="pages-container">
            <template
                is="dom-repeat"
                items="[[locationData]]"
                as="topLevelLocation"
                index-as="topLevelLocationIndex">
              <div>
                <div id="page-header-container">
                  <template
                      is="dom-if"
                      if="[[_canEnterData(computedMode, topLevelLocation.byEntity.0.is_locked)]]">
                    <div class="tab-header layout horizontal justified">
                      <div class="self-center">[[localize('enter_data_location')]]</div>
                      <div>
                        <paper-button
                            class="btn-primary"
                            modal-index="[[topLevelLocationIndex]]"
                            on-tap="_openModal"
                            raised>
                          [[localize('enter_data')]]
                        </paper-button>
                      </div>
                    </div>
                  </template>

                  <div id="reporting-tabs-list">
                    <paper-tabs
                        selected="{{topLevelLocation.selected}}"
                        hide-scroll-buttons
                        id="reporting-tabs-container">
                      <template
                          is="dom-repeat"
                          items="[[topLevelLocation.byEntity]]"
                          as="location">
                        <paper-tab>[[_localizeLowerCased(location.reporting_entity.title, localize)]]</paper-tab>
                      </template>
                    </paper-tabs>
                  </div>
                </div>

                <iron-pages selected="{{topLevelLocation.selected}}" id="page-view-container">
                  <template
                      is="dom-repeat"
                      items="[[topLevelLocation.byEntity]]"
                      as="location">
                    <div>
                      <div class="table-container app-grid">
                        <div class="item">
                          <div hidden aria-hidden="true">
                            <dl class="printme">
                              <dt style="display: inline;">[[localize('location')]]:</dt>
                              <dd style="display: inline; margin: 0;">[[location.location.title]] - [[location.reporting_entity.title]]</dd>
                            </dl>
                          </div>

                          <dl>
                            <template
                                is="dom-if"
                                if="[[_equals(location.display_type, 'number')]]"
                                restamp="true">
                              <dt>[[localize('location_progress_against')]] [[_localizeLowerCased(location.reporting_entity.title, localize)]]:</dt>
                              <dd>
                                <etools-prp-number value="[[location.location_progress.v]]"></etools-prp-number>
                              </dd>
                              <dt>[[localize('previous_location_progress')]]:</dt>
                              <dd>
                                <etools-prp-number value="[[location.previous_location_progress.v]]"></etools-prp-number>
                              </dd>
                            </template>
                            <template
                                is="dom-if"
                                if="[[!_equals(location.display_type, 'number')]]"
                                restamp="true">
                              <dt>[[localize('location_progress')]]:</dt>
                              <dd>[[_formatIndicatorValue(location.display_type, location.location_progress.c)]]</dd>
                              <dt>[[localize('previous_location_progress')]]:</dt>
                              <dd>[[_formatIndicatorValue(location.display_type, location.previous_location_progress.c)]]</dd>
                            </template>
                          </dl>

                          <disaggregation-table
                              class="printme"
                              data="[[location]]"
                              mapping="[[disaggregations.disagg_lookup_map]]"
                              labels="[[disaggregations.labels]]">
                          </disaggregation-table>
                        </div>
                      </div>
                    </div>
                  </template>
                </iron-pages>

                <template
                    is="dom-if"
                    if="[[!_equals(computedMode, 'view')]]">
                  <disaggregation-modal
                      id="modal-[[topLevelLocationIndex]]"
                      reporting-period="[[reportingPeriod]]"
                      on-opened-changed="_updateModals">
                    <div slot="meta" class="layout horizontal justified">
                      <div>
                        <h3>[[indicatorName]]</h3>
                        <p class="location">
                          <iron-icon icon="maps:place"></iron-icon>
                          [[topLevelLocation.title]]
                        </p>
                        <template
                            is="dom-if"
                            if="[[hasPD]]"
                            restamp="true">
                          <p class="current-pd">
                            [[currentPd.agreement]] | [[currentPd.title]]
                          </p>
                        </template>
                      </div>
                      <div class="layout vertical end-justified">
                        <dl class="location-progress">
                          <dt>[[localize('location_progress')]]</dt>
                          <dd>
                            <template
                                is="dom-if"
                                if="[[_equals(topLevelLocation.byEntity.0.display_type, 'number')]]"
                                restamp="true">
                              <etools-prp-number value="[[topLevelLocation.byEntity.0.location_progress.v]]"></etools-prp-number>
                            </template>
                            <template
                                is="dom-if"
                                if="[[!_equals(topLevelLocation.byEntity.0.display_type, 'number')]]"
                                restamp="true">
                              <span>[[_formatIndicatorValue(topLevelLocation.byEntity.0.display_type, topLevelLocation.byEntity.0.location_progress.c, 1)]]</span>
                            </template>
                          </dd>
                        </dl>
                      </div>
                    </div>

                    <template
                        is="dom-if"
                        if="[[_computeTableVisibility(opened, topLevelLocationIndex)]]"
                        restamp="true">
                      <disaggregation-table
                          slot="disaggregation-table"
                          data="[[topLevelLocation.byEntity.0]]"
                          by-entity="[[topLevelLocation.byEntity]]"
                          mapping="[[disaggregations.disagg_lookup_map]]"
                          labels="[[disaggregations.labels]]"
                          indicator-id="[[indicatorId]]"
                          editable="1">
                      </disaggregation-table>
                    </template>
                  </disaggregation-modal>
                </template>
              </div>
            </template>
          </iron-pages>
        </div>
      </etools-prp-printer>
    </template>

    <pull-modal
      id="pull-modal-[[indicatorId]]"
      indicator-name="[[indicatorName]]"
      reporting-period="[[reportingPeriod]]"
      indicator-id="[[indicatorId]]"
      report-id="[[reportId]]">
    </pull-modal>

    <etools-loading active="[[loading]]"></etools-loading>
  `;
    }
    _currentProgrammeDocument(rootState) {
        return currentProgrammeDocument(rootState);
    }
    _fetchData() {
        const disaggregationsThunk = this.$.disaggregations.thunk();
        // Cancel the pending request, if any
        this.$.disaggregations.abort();
        return this.reduxStore.dispatch(disaggregationsFetch(disaggregationsThunk, String(this.indicatorId)));
    }
    init() {
        if (this.indicatorId) {
            if (this.initialized) {
                return;
            }
            const self = this;
            this.set('initialized', true);
            this._fetchData()
                // @ts-ignore
                .then(() => {
                self.set('dataLoaded', true);
            })
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling
            });
        }
    }
    onLocationRendered(e) {
        if (this.locationData.length === e.detail.value) {
            this.set('loading', false);
        }
    }
    _computeDisaggregationsUrl(reportableId) {
        return Endpoints.indicatorReports(reportableId);
    }
    _computeParams(indicatorId, currentPD) {
        if (!currentPD) {
            return;
        }
        const params = {
            pks: indicatorId,
            limit: 1
        };
        if (currentPD.id !== undefined) {
            params.pd_id_for_locations = currentPD.id;
        }
        return params;
    }
    _computeDisaggregations(data, key) {
        if (data && key) {
            return this._clone(data[key]);
        }
    }
    _computeIsHfIndicator(disaggregations) {
        return disaggregations !== undefined &&
            this.reportIsQpr === true &&
            disaggregations.is_hf_indicator === true;
    }
    _computeMode(mode, overrideMode) {
        return overrideMode || mode;
    }
    _openModal(e) {
        this.shadowRoot.querySelector('#modal-' + e.target.modalIndex).open();
    }
    _openPullModal(e) {
        this.shadowRoot.querySelector('#pull-modal-' + e.target.modalIndex).open();
    }
    _updateModals(e, data) {
        const id = e.target.id;
        if (!id) {
            return;
        }
        const change = {};
        change[id] = data.value;
        this.set('opened', Object.assign({}, this.opened, change));
    }
    _computeTableVisibility(opened, index) {
        return !!opened['modal-' + index];
    }
    _computeLocationStatus(location) {
        return location.byEntity[0].is_complete ? 'success' : 'error';
    }
    _computeHasPD(currentPD) {
        return !!Object.keys(currentPD).length;
    }
    _onLocationsUpdated(e) {
        e.stopPropagation();
        this._fetchData();
        fireEvent(this, 'refresh-report', String(this.indicatorId));
        const allComplete = this.disaggregations.indicator_location_data
            .every(function (location) {
            return location.is_complete;
        });
        if (!allComplete) {
            return;
        }
        fireEvent(this, 'report-complete', {
            indicatorId: this.indicatorId,
            reportableId: this.reportableId
        });
    }
    _computeLocationData(rawLocationData) {
        const byLocation = (rawLocationData || [])
            .reduce(function (acc, location) {
            const locationId = location.location.id;
            if (typeof acc[locationId] === 'undefined') {
                acc[locationId] = {
                    title: location.location.title,
                    byEntity: [],
                    selected: 0
                };
            }
            acc[locationId].byEntity.push(location);
            if (acc[locationId].byEntity.length >= 2) {
                acc[locationId].selected = acc[locationId].byEntity.length - 1;
            }
            return acc;
        }, {});
        return Object.keys(byLocation)
            .map(function (key) {
            return byLocation[key];
        })
            .sort(function (a, b) {
            return b.is_master_location_data - a.is_master_location_data;
        });
    }
    _isDualReportingEnabled(entities) {
        return entities.length > 1;
    }
    _canEnterData(mode, isLocked) {
        return mode !== 'view' && !isLocked;
    }
    _computeDisablePull(reportStatus) {
        return reportStatus === 'Sub' || reportStatus === 'Acc';
    }
    _addEventListeners() {
        this._onLocationsUpdated = this._onLocationsUpdated.bind(this);
        this.addEventListener('locations-updated', this._onLocationsUpdated);
    }
    _removeEventListeners() {
        this.removeEventListener('locations-updated', this._onLocationsUpdated);
    }
    connectedCallback() {
        super.connectedCallback();
        this.set('opened', {});
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: Boolean })
], IndicatorDetails.prototype, "dataLoaded", void 0);
__decorate([
    property({ type: Boolean })
], IndicatorDetails.prototype, "loading", void 0);
__decorate([
    property({ type: Number })
], IndicatorDetails.prototype, "indicatorId", void 0);
__decorate([
    property({ type: String })
], IndicatorDetails.prototype, "indicatorName", void 0);
__decorate([
    property({ type: String })
], IndicatorDetails.prototype, "indicatorStatus", void 0);
__decorate([
    property({ type: String })
], IndicatorDetails.prototype, "reportType", void 0);
__decorate([
    property({ type: Number })
], IndicatorDetails.prototype, "reportableId", void 0);
__decorate([
    property({ type: String })
], IndicatorDetails.prototype, "reportId", void 0);
__decorate([
    property({ type: String })
], IndicatorDetails.prototype, "reportingPeriod", void 0);
__decorate([
    property({ type: Object })
], IndicatorDetails.prototype, "opened", void 0);
__decorate([
    property({ type: Number })
], IndicatorDetails.prototype, "selected", void 0);
__decorate([
    property({ type: Boolean })
], IndicatorDetails.prototype, "initialized", void 0);
__decorate([
    property({ type: Object, computed: '_currentProgrammeDocument(rootState)' })
], IndicatorDetails.prototype, "currentPd", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeHasPD(currentPd)' })
], IndicatorDetails.prototype, "hasPD", void 0);
__decorate([
    property({ type: String, computed: '_computeDisaggregationsUrl(reportableId)' })
], IndicatorDetails.prototype, "disaggregationsUrl", void 0);
__decorate([
    property({ type: Object, computed: '_computeParams(indicatorId, currentPd)' })
], IndicatorDetails.prototype, "params", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.disaggregations.byIndicator)' })
], IndicatorDetails.prototype, "data", void 0);
__decorate([
    property({ type: Object, computed: '_computeDisaggregations(data, indicatorId)' })
], IndicatorDetails.prototype, "disaggregations", void 0);
__decorate([
    property({ type: Array, computed: '_computeLocationData(disaggregations.indicator_location_data)' })
], IndicatorDetails.prototype, "locationData", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.mode)' })
], IndicatorDetails.prototype, "mode", void 0);
__decorate([
    property({ type: String })
], IndicatorDetails.prototype, "overrideMode", void 0);
__decorate([
    property({ type: String, computed: '_computeMode(mode, overrideMode)' })
], IndicatorDetails.prototype, "computedMode", void 0);
__decorate([
    property({ type: Boolean })
], IndicatorDetails.prototype, "reportIsQpr", void 0);
__decorate([
    property({ type: String })
], IndicatorDetails.prototype, "reportStatus", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeDisablePull(reportStatus)' })
], IndicatorDetails.prototype, "disablePull", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeIsHfIndicator(disaggregations)' })
], IndicatorDetails.prototype, "isHfIndicator", void 0);
window.customElements.define('indicator-details', IndicatorDetails);
export { IndicatorDetails as IndicatorDetailsEl };
