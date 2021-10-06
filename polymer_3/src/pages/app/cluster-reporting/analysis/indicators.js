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
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import '../../../../elements/etools-prp-ajax';
import '../../../../elements/cluster-reporting/analysis/indicators-filters';
import '../../../../elements/cluster-reporting/analysis/indicators';
import Endpoints from '../../../../endpoints';
import UtilsMixin from '../../../../mixins/utils-mixin';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { analysis_indicators_fetchData } from '../../../../redux/actions/analysis';
/**
 * @polymer
 * @customElement
 * @appliesMixin SortingMixin
 * @appliesMixin LocalizeMixin
 */
class PageAnalysisIndicators extends UtilsMixin(ReduxConnectedElement) {
    static get template() {
        return html `
    <style>
      :host {
        display: block;
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

    <analysis-indicators-filters></analysis-indicators-filters>
    <analysis-indicators></analysis-indicators>
  `;
    }
    static get observers() {
        return [
            '_fetchData(dataUrl, queryParams)'
        ];
    }
    _computeDataUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.analysisIndicators(responsePlanId);
    }
    _fetchData() {
        if (!this.dataUrl) {
            return;
        }
        const self = this;
        this.fetchDataDebouncer = Debouncer.debounce(this.fetchDataDebouncer, timeOut.after(300), () => {
            const dataThunk = this.$.data.thunk();
            self.$.data.abort();
            self.reduxStore.dispatch(analysis_indicators_fetchData(dataThunk))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._cancelDebouncers([
            this.fetchDataDebouncer
        ]);
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], PageAnalysisIndicators.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String, computed: '_computeDataUrl(responsePlanId)' })
], PageAnalysisIndicators.prototype, "dataUrl", void 0);
window.customElements.define('page-analysis-indicators', PageAnalysisIndicators);
