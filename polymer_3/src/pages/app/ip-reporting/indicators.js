var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
// import '@polymer/paper-material/paper-material';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../etools-prp-common/elements/page-header';
import '../../../etools-prp-common/elements/page-body';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../elements/ip-reporting/indicators-filters';
import '../../../elements/ip-reporting/indicators-toolbar';
import '../../../elements/list-view-indicators';
import Endpoints from '../../../endpoints';
import SortingMixin from '../../../etools-prp-common/mixins/sorting-mixin';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { fetchIndicators } from '../../../redux/actions/indicators';
/**
 * @polymer
 * @customElement
 * @appliesMixin SortingMixin
 * @appliesMixin LocalizeMixin
 */
class PageIpReportingIndicators extends LocalizeMixin(SortingMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="indicators" url="[[indicatorsUrl]]" params="[[queryParams]]"> </etools-prp-ajax>

      <page-header title="[[localize('indicators')]]"></page-header>
      <page-body>
        <indicators-filters></indicators-filters>
        <indicators-toolbar></indicators-toolbar>
        <list-view-indicators data="[[data]]" total-results="[[totalResults]]"> </list-view-indicators>
      </page-body>
    `;
    }
    static get observers() {
        return ['_indicatorsAjax(indicatorsUrl, queryParams)'];
    }
    _computeIndicatorsUrl(workspaceId) {
        return Endpoints.allPDIndicators(workspaceId);
    }
    _indicatorsAjax(_, queryParams) {
        if (!Object.keys(queryParams).length) {
            return;
        }
        this.fetchIndicatorsDebouncer = Debouncer.debounce(this.fetchIndicatorsDebouncer, timeOut.after(100), () => {
            const indicatorsThunk = this.$.indicators.thunk();
            // Cancel the pending request, if any
            this.$.indicators.abort();
            this.reduxStore
                .dispatch(fetchIndicators(indicatorsThunk))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.fetchIndicatorsDebouncer && this.fetchIndicatorsDebouncer.isActive) {
            this.fetchIndicatorsDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.indicators.all)' })
], PageIpReportingIndicators.prototype, "data", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.indicators.loading)' })
], PageIpReportingIndicators.prototype, "loading", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.indicators.count)' })
], PageIpReportingIndicators.prototype, "totalResults", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PageIpReportingIndicators.prototype, "workspaceId", void 0);
__decorate([
    property({ type: String, computed: '_computeIndicatorsUrl(workspaceId)' })
], PageIpReportingIndicators.prototype, "indicatorsUrl", void 0);
__decorate([
    property({ type: String })
], PageIpReportingIndicators.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], PageIpReportingIndicators.prototype, "queryParams", void 0);
window.customElements.define('page-ip-reporting-indicators', PageIpReportingIndicators);
