import {ReduxConnectedElement} from '../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import '../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../elements/cluster-reporting/analysis/indicators-filters';
import '../../../../elements/cluster-reporting/analysis/indicators';
import Endpoints from '../../../../etools-prp-common/endpoints';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-common/elements/etools-prp-ajax';
import {analysis_indicators_fetchData} from '../../../../etools-prp-common/redux/actions/analysis';

/**
 * @polymer
 * @customElement
 * @appliesMixin SortingMixin
 * @appliesMixin LocalizeMixin
 */
class PageAnalysisIndicators extends UtilsMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="data" url="[[dataUrl]]" params="[[queryParams]]"> </etools-prp-ajax>

      <analysis-indicators-filters></analysis-indicators-filters>
      <analysis-indicators></analysis-indicators>
    `;
  }

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String, computed: '_computeDataUrl(responsePlanId)'})
  dataUrl!: string;

  fetchDataDebouncer!: Debouncer;

  static get observers() {
    return ['_fetchData(dataUrl, queryParams)'];
  }

  _computeDataUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.analysisIndicators(responsePlanId);
  }

  _fetchData() {
    if (!this.dataUrl) {
      return;
    }

    this.fetchDataDebouncer = Debouncer.debounce(this.fetchDataDebouncer, timeOut.after(300), () => {
      const dataThunk = (this.$.data as EtoolsPrpAjaxEl).thunk();

      (this.$.data as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(analysis_indicators_fetchData(dataThunk))
        // @ts-ignore
        .catch((_err: any) => {
          // TODO: error handling
        });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._cancelDebouncers([this.fetchDataDebouncer]);
  }
}

window.customElements.define('page-analysis-indicators', PageAnalysisIndicators);
