var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import '../../../../elements/etools-prp-ajax';
import '../../../../elements/cluster-reporting/analysis/partners-per-type';
import '../../../../elements/cluster-reporting/analysis/partners-per-cluster';
import '../../../../elements/cluster-reporting/analysis/partners-per-cluster-objective';
import '../../../../elements/cluster-reporting/analysis/operational-presence-map';
import '../../../../elements/cluster-reporting/analysis/operational-presence-table';
import Endpoints from '../../../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { analysis_operationalPresence_fetchData, analysis_operationalPresence_fetchMap } from '../../../../redux/actions/analysis';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageAnalysisOperationalPresence extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
    <style include="iron-flex iron-flex-alignment app-grid-style">
      :host {
        display: block;

        --app-grid-columns: 2;
        --app-grid-gutter: 25px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 2;

        --ecp-content: {
          padding: 0;
          background: #fff;
        };
      }

      .full-width {
        @apply --app-grid-expandible-item;
      }

      .header {
        padding: 0 25px;
        background: var(--paper-grey-300);
      }

      .header h2,
      .header dl {
        margin: 0;
        font-size: 18px;
        line-height: 48px;
        font-weight: normal;
        color: var(--paper-grey-600);
      }

      .header dt,
      .header dd {
        display: inline;
      }

      .header dd {
        margin-left: .5em;
        color: var(--theme-primary-color);
      }

      .clusters {
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .clusters li:not(:first-child) {
        padding-left: .75em;
        margin-left: .75em;
        border-left: 1px solid var(--paper-grey-300);
      }

      hr {
        border-top: 0;
        border-bottom: 1px solid var(--paper-grey-200);
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="data"
        url="[[dataUrl]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <etools-prp-ajax
        id="map"
        url="[[mapUrl]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <etools-content-panel no-header>
      <header class="header layout horizontal justified">
        <h2>[[localize('clusters')]]</h2>
        <dl>
          <dt>[[localize('number_of_clusters')]]:</dt>
          <dd>[[numberOfClusters]]</dd>
        </dl>
      </header>

      <div class="app-grid">
        <div class="item full-width">
          <ul class="clusters layout horizontal wrap">
            <template
                is="dom-repeat"
                items="[[clusters]]"
                as="cluster">
              <li>[[cluster.title]]</li>
            </template>
          </ul>
        </div>
      </div>

      <header class="header layout horizontal justified">
        <h2>[[localize('partners')]]</h2>
        <dl>
          <dt>[[localize('number_of_partners')]]:</dt>
          <dd>[[numberOfPartners]]</dd>
        </dl>
      </header>

      <div class="app-grid">
        <div class="item">
          <partners-per-type></partners-per-type>
        </div>
        <div class="item">
          <partners-per-cluster></partners-per-cluster>
        </div>
      </div>

      <hr>

      <div class="app-grid">
        <div class="item full-width">
          <partners-per-cluster-objective></partners-per-cluster-objective>
        </div>
      </div>

      <hr>

      <div class="app-grid">
        <div class="item full-width">
          <operational-presence-map></operational-presence-map>
        </div>
      </div>

      <hr>

      <div class="app-grid">
        <div class="item full-width">
          <operational-presence-table></operational-presence-table>
        </div>
      </div>
    </etools-content-panel>
  `;
    }
    static get observers() {
        return [
            '_fetchData(dataUrl, queryParams)',
            '_fetchMap(mapUrl, queryParams)'
        ];
    }
    _computeApiUrl(responsePlanId, type) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.analysisOperationalPresence(responsePlanId, type);
    }
    _fetchData() {
        if (!this.dataUrl) {
            return;
        }
        const self = this;
        this.fetchDataDebouncer = Debouncer.debounce(this.fetchDataDebouncer, timeOut.after(300), () => {
            const dataThunk = this.$.data.thunk();
            self.$.data.abort();
            self.reduxStore.dispatch(analysis_operationalPresence_fetchData(dataThunk))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling
            });
        });
    }
    _fetchMap() {
        if (!this.mapUrl) {
            return;
        }
        const self = this;
        this.fetchMapDebouncer = Debouncer.debounce(this.fetchMapDebouncer, timeOut.after(300), () => {
            const mapThunk = this.$.map.thunk();
            self.$.map.abort();
            self.reduxStore.dispatch(analysis_operationalPresence_fetchMap(mapThunk))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._cancelDebouncers([
            this.fetchDataDebouncer,
            this.fetchMapDebouncer
        ]);
    }
}
__decorate([
    property({ type: String, computed: '_computeApiUrl(responsePlanId, \'data\')' })
], PageAnalysisOperationalPresence.prototype, "dataUrl", void 0);
__decorate([
    property({ type: String, computed: '_computeApiUrl(responsePlanId, \'map\')' })
], PageAnalysisOperationalPresence.prototype, "mapUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], PageAnalysisOperationalPresence.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.analysis.operationalPresence.data.num_of_clusters)' })
], PageAnalysisOperationalPresence.prototype, "numberOfClusters", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.analysis.operationalPresence.data.num_of_partners)' })
], PageAnalysisOperationalPresence.prototype, "numberOfPartners", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.analysis.operationalPresence.data.clusters)' })
], PageAnalysisOperationalPresence.prototype, "clusters", void 0);
window.customElements.define('page-analysis-operational-presence', PageAnalysisOperationalPresence);
