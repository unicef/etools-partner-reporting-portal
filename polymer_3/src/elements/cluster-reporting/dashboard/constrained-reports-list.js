var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-location/iron-query-params';
import LocalizeMixin from '../../../mixins/localize-mixin';
import RoutingMixin from '../../../mixins/routing-mixin';
import { tableStyles } from '../../../styles/table-styles';
import '../../etools-prp-progress-bar-alt';
import '../../list-placeholder';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
class ConstrainedReportsList extends LocalizeMixin(RoutingMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      ${tableStyles}
      <style include="data-table-styles">
      :host {
        display: block;

        --ecp-content: {
          padding: 0;
        };
      }

      a {
        text-decoration: none;
        color: var(--theme-primary-color);
      }

      footer {
        padding: 16px;
        text-align: right;
        text-transform: uppercase;
      }
    </style>

    <iron-query-params
        id="queryParams"
        params-string="{{resultsQuery}}"
        params-object="{{resultsQueryParams}}">
    </iron-query-params>

    <etools-content-panel panel-title="[[localize('submitted_list_constrained')]]">
      <etools-data-table-header
          no-title
          no-collapse>
        <etools-data-table-column field="cluster">
          <div class="table-column">[[localize('cluster')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="title" flex-2>
          <div class="table-column flex-2">[[localize('indicator')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="partner">
          <div class="table-column">[[localize('partner')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="last_reported">
          <div class="table-column">[[localize('last_reported')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="progress_percentage" flex-2>
          <div class="table-column">[[localize('current_progress')]]</div>
        </etools-data-table-column>
      </etools-data-table-header>

      <template
          is="dom-repeat"
          items="[[data]]">
        <etools-data-table-row no-collapse>
          <div slot="row-data">
            <div class="table-cell table-cell--text">
              [[item.cluster.title]]
            </div>
            <div class="table-cell table-cell--text" flex-2>
              <a href="[[_getReportUrl(_baseUrlCluster, item.reportable.id, resultsQueryParams)]]">[[item.title]]</a>
            </div>
            <div class="table-cell table-cell--text">
              [[item.partner.title]]
            </div>
            <div class="table-cell table-cell--text">
              [[item.submission_date]]
            </div>
            <div class="table-cell" flex-2>
              <etools-prp-progress-bar
                  number="[[item.reportable.progress_percentage]]">
              </etools-prp-progress-bar>
            </div>
          </div>
        </etools-data-table-row>
      </template>

      <list-placeholder
          data="[[data]]"
          loading="[[loading]]">
      </list-placeholder>

      <etools-loading active="[[loading]]"></etools-loading>
    </etools-content-panel>
    `;
    }
    _computeReportsUrl(baseUrl, query) {
        return this.buildUrl(baseUrl, '/results/submitted?' + query);
    }
    _getReportUrl(baseUrl, id, query) {
        const queryWithIndicator = Object.assign({}, query, {
            indicator: id
        });
        const base = this.buildUrl(baseUrl, '/results/submitted');
        let search;
        try {
            search = '?' + this.$.queryParams._encodeParams(queryWithIndicator);
        }
        catch (err) {
            search = '';
        }
        return base + search;
    }
    _computeResultsQueryParams(partner) {
        return {
            partner: partner.id
        };
    }
}
__decorate([
    property({ type: String })
], ConstrainedReportsList.prototype, "resultsQuery", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.clusterDashboardData.data.constrained_indicator_reports)' })
], ConstrainedReportsList.prototype, "data", void 0);
__decorate([
    property({ type: String, computed: '_computeReportsUrl(_baseUrlCluster, resultsQuery)' })
], ConstrainedReportsList.prototype, "reportsUrl", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)' })
], ConstrainedReportsList.prototype, "loading", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partner.current)' })
], ConstrainedReportsList.prototype, "partner", void 0);
__decorate([
    property({ type: Object, computed: '_computeResultsQueryParams(partner)' })
], ConstrainedReportsList.prototype, "resultsQueryParams", void 0);
window.customElements.define('constrained-reports-list', ConstrainedReportsList);
export { ConstrainedReportsList as ConstrainedReportsListEl };
