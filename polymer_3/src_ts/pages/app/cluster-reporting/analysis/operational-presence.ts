import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
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
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {EtoolsPrpAjaxEl} from '../../../../elements/etools-prp-ajax';
import {
  analysis_operationalPresence_fetchData,
  analysis_operationalPresence_fetchMap
} from '../../../../redux/actions/analysis';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageAnalysisOperationalPresence extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      <style include="iron-flex iron-flex-alignment app-grid-style">
        :host {
          display: block;

          --app-grid-columns: 2;
          --app-grid-gutter: 25px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
          background: #fff;
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
          margin-left: 0.5em;
          color: var(--theme-primary-color);
        }

        .clusters {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .clusters li:not(:first-child) {
          padding-left: 0.75em;
          margin-left: 0.75em;
          border-left: 1px solid var(--paper-grey-300);
        }

        hr {
          border-top: 0;
          border-bottom: 1px solid var(--paper-grey-200);
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="data" url="[[dataUrl]]" params="[[queryParams]]"> </etools-prp-ajax>

      <etools-prp-ajax id="map" url="[[mapUrl]]" params="[[queryParams]]"> </etools-prp-ajax>

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
              <template is="dom-repeat" items="[[clusters]]" as="cluster">
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

        <hr />

        <div class="app-grid">
          <div class="item full-width">
            <partners-per-cluster-objective></partners-per-cluster-objective>
          </div>
        </div>

        <hr />

        <div class="app-grid">
          <div class="item full-width">
            <operational-presence-map></operational-presence-map>
          </div>
        </div>

        <hr />

        <div class="app-grid">
          <div class="item full-width">
            <operational-presence-table></operational-presence-table>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: String, computed: "_computeApiUrl(responsePlanId, 'data')"})
  dataUrl!: string;

  @property({type: String, computed: "_computeApiUrl(responsePlanId, 'map')"})
  mapUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Number, computed: 'getReduxStateValue(rootState.analysis.operationalPresence.data.num_of_clusters)'})
  numberOfClusters!: number;

  @property({type: Number, computed: 'getReduxStateValue(rootState.analysis.operationalPresence.data.num_of_partners)'})
  numberOfPartners!: number;

  @property({type: Array, computed: 'getReduxStateArray(rootState.analysis.operationalPresence.data.clusters)'})
  clusters!: any[];

  private fetchDataDebouncer!: Debouncer;
  private fetchMapDebouncer!: Debouncer;

  static get observers() {
    return ['_fetchData(dataUrl, queryParams)', '_fetchMap(mapUrl, queryParams)'];
  }

  _computeApiUrl(responsePlanId: string, type: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.analysisOperationalPresence(responsePlanId, type);
  }

  _fetchData() {
    if (!this.dataUrl) {
      return;
    }

    this.fetchDataDebouncer = Debouncer.debounce(this.fetchDataDebouncer, timeOut.after(300), () => {
      const dataThunk = (this.$.data as EtoolsPrpAjaxEl).thunk();

      (this.$.data as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(analysis_operationalPresence_fetchData(dataThunk))
        // @ts-ignore
        .catch((_err: any) => {
          // TODO: error handling
        });
    });
  }

  _fetchMap() {
    if (!this.mapUrl) {
      return;
    }

    this.fetchMapDebouncer = Debouncer.debounce(this.fetchMapDebouncer, timeOut.after(300), () => {
      const mapThunk = (this.$.map as EtoolsPrpAjaxEl).thunk();

      (this.$.map as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(analysis_operationalPresence_fetchMap(mapThunk))
        // @ts-ignore
        .catch((_err: any) => {
          // TODO: error handling
        });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._cancelDebouncers([this.fetchDataDebouncer, this.fetchMapDebouncer]);
  }
}

window.customElements.define('page-analysis-operational-presence', PageAnalysisOperationalPresence);
