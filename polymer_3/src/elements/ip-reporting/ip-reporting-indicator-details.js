var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import { fetchIndicatorDetails } from '../../redux/actions/indicators';
import '../../etools-prp-common/elements/labelled-item';
import '../../etools-prp-common/elements/report-status';
import '../../etools-prp-common/elements/disaggregations/disaggregation-table';
import '../../etools-prp-common/elements/list-placeholder';
import { computeParams, computeIndicatorReportsUrl, bucketByLocation, computeHidden } from './js/ip-reporting-indicator-details-functions';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class IpReportingIndicatorDetails extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      <style include="iron-flex iron-flex-alignment iron-flex-factors app-grid-style">
        :host {
          display: block;
          width: 100%;

          --paper-tabs: {
            border-bottom: 1px solid var(--paper-grey-300);
          }

          --app-grid-columns: 2;
          --app-grid-gutter: 15px;
          --app-grid-item-height: auto;
        }

        .item {
          padding: 0;
        }

        .loading-wrapper {
          padding: 15px;
        }

        h4 {
          margin: 0 0 1em;
          font-size: 12px;
          font-weight: normal;
        }

        h4 > span:last-child {
          padding-left: 10px;
          text-align: right;
        }

        .reporting-period {
          color: var(--theme-primary-text-color-medium);
        }

        .report-meta {
          font-size: 12px;
          background: var(--paper-grey-100);
        }

        .report-meta dt,
        .report-meta dd {
          display: inline;
          margin: 0;
        }

        .report-meta dt {
          font-weight: bold;
        }

        .report-meta dd {
          color: var(--paper-grey-600);
        }

        .report-meta labelled-item {
          margin: 1em 0;
        }
      </style>

      <etools-prp-ajax id="indicatorDetail" url="[[indicatorDetailUrl]]" params="[[params]]"> </etools-prp-ajax>

      <template is="dom-if" if="[[loading]]">
        <div class="loading-wrapper">
          <etools-loading no-overlay></etools-loading>
        </div>
      </template>

      <template is="dom-if" if="[[_computeHidden(data, 'true')]]">
        <div class="report-meta app-grid">
          <template is="dom-repeat" items="[[data]]" as="report">
            <div class="item">
              <dl>
                <dt>[[localize('submitted')]]:</dt>
                <dd>[[report.submission_date]]</dd>
              </dl>
              <dl>
                <dt>[[localize('total_progress')]]:</dt>
                <dd>
                  <template is="dom-if" if="[[_equals(report.display_type, 'number')]]" restamp="true">
                    <etools-prp-number value="[[report.total.v]]"></etools-prp-number>
                  </template>
                  <template is="dom-if" if="[[!_equals(report.display_type, 'number')]]" restamp="true">
                    [[_formatIndicatorValue(report.display_type, report.total.c, 1)]]
                  </template>
                </dd>
              </dl>
              <dl>
                <dt>[[localize('progress_in_reporting_period')]]:</dt>
                <dd class="reporting-period">[[report.time_period_start]] - [[report.time_period_end]]</dd>
              </dl>
            </div>
          </template>
        </div>
      </template>

      <list-placeholder data="[[data]]" loading="[[loading]]" message="[[localize('no_report_data')]]">
      </list-placeholder>

      <template is="dom-if" if="[[_computeHidden(locations, 'true')]]">
        <paper-tabs
          selected="{{selected}}"
          fallback-selection="location-[[locations.0.current.id]]"
          attr-for-selected="name"
          scrollable
        >
          <template is="dom-repeat" items="[[locations]]" as="location">
            <paper-tab name="location-[[location.current.id]]"> [[location.name]] </paper-tab>
          </template>
        </paper-tabs>
      </template>

      <iron-pages attr-for-selected="name" selected="{{selected}}">
        <template is="dom-repeat" items="[[locations]]" as="location">
          <div name="location-[[location.current.id]]">
            <div class="app-grid">
              <template is="dom-if" if="[[location.current]]">
                <div class="item">
                  <disaggregation-table
                    data="[[location.current]]"
                    mapping="[[location.reportInfo.current.disagg_lookup_map]]"
                  >
                  </disaggregation-table>
                </div>
              </template>

              <template is="dom-if" if="[[location.previous]]">
                <div class="item">
                  <disaggregation-table
                    data="[[location.previous]]"
                    mapping="[[location.reportInfo.previous.disagg_lookup_map]]"
                  >
                  </disaggregation-table>
                </div>
              </template>
            </div>
          </div>
        </template>
      </iron-pages>
    `;
    }
    static get observers() {
        return ['_getDataByKey(dataDict)'];
    }
    _computeParams() {
        computeParams(false);
    }
    _computeIndicatorReportsUrl(indicator) {
        return computeIndicatorReportsUrl(indicator);
    }
    _bucketByLocation(data) {
        return bucketByLocation(data);
    }
    _getDataByKey(dataDict) {
        if (dataDict.details) {
            this.data = dataDict.details[this.indicator.id];
        }
    }
    _computeHidden(data, loading) {
        return computeHidden(data, loading);
    }
    _openChanged() {
        if (this.isOpen) {
            const thunk = this.$.indicatorDetail.thunk();
            this.reduxStore
                .dispatch(fetchIndicatorDetails(thunk, this.indicator.id))
                // @ts-ignore
                .catch((_err) => {
                //   // TODO: error handling.
            });
        }
        else {
            this.$.indicatorDetail.abort();
        }
    }
}
__decorate([
    property({ type: String, computed: '_computeIndicatorReportsUrl(indicator)' })
], IpReportingIndicatorDetails.prototype, "indicatorDetailUrl", void 0);
__decorate([
    property({ type: Number })
], IpReportingIndicatorDetails.prototype, "selected", void 0);
__decorate([
    property({ type: Boolean, observer: '_openChanged' })
], IpReportingIndicatorDetails.prototype, "isOpen", void 0);
__decorate([
    property({ type: Object })
], IpReportingIndicatorDetails.prototype, "indicator", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.indicators.loadingDetails)' })
], IpReportingIndicatorDetails.prototype, "loading", void 0);
__decorate([
    property({ type: Array })
], IpReportingIndicatorDetails.prototype, "data", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.indicators.details)' })
], IpReportingIndicatorDetails.prototype, "dataDict", void 0);
__decorate([
    property({ type: Array, computed: '_bucketByLocation(data)' })
], IpReportingIndicatorDetails.prototype, "locations", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.app.current)' })
], IpReportingIndicatorDetails.prototype, "appName", void 0);
__decorate([
    property({ type: Object, computed: '_computeParams()' })
], IpReportingIndicatorDetails.prototype, "params", void 0);
window.customElements.define('ip-reporting-indicator-details', IpReportingIndicatorDetails);
