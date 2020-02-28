import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
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
import {fireEvent} from '../utils/fire-custom-event';
import {GenericObject} from '../typings/globals.types';
import Endpoints from '../endpoints';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {buttonsStyles} from '../styles/buttons-styles';
import {disaggregationsFetch} from '../redux/actions/disaggregations';
// (dci) make sure Pd is correct without these...
// import {currentProgrammeDocument} from '../redux/selectors/programmeDocuments';
// import {RootState} from '../typings/redux.types';
import {EtoolsPrpAjaxEl} from './etools-prp-ajax';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class IndicatorDetails extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
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

        --paper-item-min-height: 56px;
        --paper-item: {
          cursor: pointer;
        };

        --paper-item-selected: {
          background-color: var(--theme-secondary-color-d);
        };

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
        overflow: auto;
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
        content: '\A';
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

      #tab-item {
        padding-left: 10%;
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

    <template is="dom-if" if="[[!loading]]">
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
                  as="topLevelLocation">
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

  @property({type: Number})
  indicatorId!: number;

  @property({type: String})
  indicatorName!: string;

  @property({type: String})
  indicatorStatus!: string;

  @property({type: String})
  reportType!: string;

  @property({type: Number})
  reportableId!: number;

  @property({type: String})
  reportId!: string;

  @property({type: String})
  reportingPeriod!: string;

  @property({type: Object})
  opened!: GenericObject;

  @property({type: Number})
  selected: number = 0;

  @property({type: Boolean})
  initialized: boolean = false;

  @property({type: Object})
  currentPd!: GenericObject;

  @property({type: Boolean, computed: '_computeHasPD(currentPd)'})
  hasPD!: boolean;

  @property({type: String, computed: '_computeDisaggregationsUrl(reportableId)'})
  disaggregationsUrl!: string;

  @property({type: Object, computed: '_computeParams(indicatorId, currentPd)'})
  params!: GenericObject;

  @property({type: Object, computed: 'getReduxStateObject(rootState.disaggregations.byIndicator)'})
  data!: GenericObject;

  @property({type: Object, computed: '_computeDisaggregations(data, indicatorId)'})
  disaggregations!: GenericObject;

  @property({type: Array, computed: '_computeLocationData(disaggregations.indicator_location_data)'})
  locationData!: GenericObject[];

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.mode)'})
  mode: string = '';

  @property({type: String})
  overrideMode: string = '';

  @property({type: String, computed: '_computeMode(mode, overrideMode)'})
  computedMode!: string;

  @property({type: Boolean})
  reportIsQpr!: boolean;

  @property({type: String})
  reportStatus!: string;

  @property({type: Boolean, computed: '_computeDisablePull(reportStatus)'})
  disablePull!: boolean;

  @property({type: Boolean, computed: '_computeIsHfIndicator(disaggregations)'})
  isHfIndicator!: boolean;

  _fetchData() {
    const disaggregationsThunk = (this.$.disaggregations as EtoolsPrpAjaxEl).thunk();
    // Cancel the pending request, if any
    (this.$.disaggregations as EtoolsPrpAjaxEl).abort();

    return this.reduxStore.dispatch(
      disaggregationsFetch(disaggregationsThunk, String(this.indicatorId))
    );
  }

  init() {
    if (this.indicatorId) {
      const self = this;

      if (this.initialized) {
        return;
      }

      this.set('initialized', true);

      this._fetchData()
        // @ts-ignore
        .then(function() {
          self.set('loading', false);
        })
        // @ts-ignore
        .catch(function(err) {
          // TODO: error handling
        });
    }
  }

  _computeDisaggregationsUrl(reportableId: string) {
    return Endpoints.indicatorReports(reportableId);
  }

  _computeParams(indicatorId: number, currentPD: GenericObject) {
    if (!currentPD) {
      return;
    }
    const params: GenericObject = {
      pks: indicatorId,
      limit: 1,
    };

    if (currentPD.id !== undefined) {
      params.pd_id_for_locations = currentPD.id;
    }

    return params;
  }

  _computeDisaggregations(data: GenericObject, key: string) {
    if (data && key) {
      return this._clone(data[key]);
    }
  }

  _computeIsHfIndicator(disaggregations: GenericObject) {
    return disaggregations !== undefined
      && this.reportIsQpr === true
      && disaggregations.is_hf_indicator === true;
  }

  _computeMode(mode: string, overrideMode: string) {
    return overrideMode || mode;
  }

  _openModal(e: CustomEvent) {
    this.shadowRoot!.querySelector('#modal-' + e.target.modalIndex).open();
  }

  _openPullModal(e: CustomEvent) {
    this.shadowRoot!.querySelector('#pull-modal-' + e.target.modalIndex).open();
  }

  _updateModals(e: CustomEvent, data: GenericObject) {
    const id = e.target!.id;

    if (!id) {
      return;
    }

    const change: GenericObject = {};
    change[id] = data.value;

    this.set('opened', Object.assign({}, this.opened, change));
  }

  _computeTableVisibility(opened: GenericObject, index: string) {
    return !!opened['modal-' + index];
  }

  _computeLocationStatus(location: GenericObject) {
    return location.byEntity[0].is_complete ? 'success' : 'error';
  }

  _computeHasPD(currentPD: GenericObject) {
    return !!Object.keys(currentPD).length;
  }

  _onLocationsUpdated(e: CustomEvent) {
    e.stopPropagation();

    this._fetchData();

    fireEvent(this, 'refresh-report', String(this.indicatorId));

    const allComplete = this.disaggregations.indicator_location_data
      .every(function(location: GenericObject) {
        return location.is_complete;
      });

    if (!allComplete) {
      return;
    }

    fireEvent(this, 'report-complete', {
      indicatorId: this.indicatorId,
      reportableId: this.reportableId,
    });
  }

  _computeLocationData(rawLocationData: any[]) {
    const byLocation = (rawLocationData || [])
      .reduce(function(acc, location) {
        const locationId = location.location.id;

        if (typeof acc[locationId] === 'undefined') {
          acc[locationId] = {
            title: location.location.title,
            byEntity: [],
            selected: 0,
          };
        }

        acc[locationId].byEntity.push(location);
        if (acc[locationId].byEntity.length >= 2) {
          acc[locationId].selected = acc[locationId].byEntity.length - 1;
        }
        return acc;
      }, {});

    return Object.keys(byLocation)
      .map(function(key) {
        return byLocation[key];
      })
      .sort(function(a, b) {
        return b.is_master_location_data - a.is_master_location_data;
      });
  }

  _isDualReportingEnabled(entities: any[]) {
    return entities.length > 1;
  }

  _canEnterData(mode: string, isLocked: boolean) {
    return mode !== 'view' && !isLocked;
  }

  _computeDisablePull(reportStatus: string) {
    return reportStatus === 'Sub' || reportStatus === 'Acc';
  }

  _addEventListeners() {
    this._onLocationsUpdated = this._onLocationsUpdated.bind(this);
    this.addEventListener('locations-updated', this._onLocationsUpdated as any);
  }

  _removeEventListeners() {
    this.removeEventListener('locations-updated', this._onLocationsUpdated as any);
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
window.customElements.define('indicator-details', IndicatorDetails);

export {IndicatorDetails as IndicatorDetailsEl};
