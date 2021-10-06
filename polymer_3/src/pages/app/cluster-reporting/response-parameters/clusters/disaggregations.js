var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-flex-layout/iron-flex-layout';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/disaggregations/creation-modal';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/disaggregations/disaggregations-list';
import '../../../../../elements/etools-prp-permissions';
import '../../../../../elements/page-body';
import { tableStyles } from '../../../../../styles/table-styles';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import Endpoints from '../../../../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { fetchClusterDisaggregationsList } from '../../../../../redux/actions/clusterDisaggregations';
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin RoutingMixin
*/
class Disaggregations extends LocalizeMixin(UtilsMixin(RoutingMixin(ReduxConnectedElement))) {
    static get template() {
        return html `
    ${tableStyles} ${buttonsStyles}
    <style include="iron-flex data-table-styles">
      :host {
        display: block;
      }

      div#action {
        margin: 25px 0;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }

      a {
        color: var(--theme-primary-color);
      }
    </style>

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

    <iron-location query="{{query}}"></iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="disaggregations"
        url="[[disaggregationsUrl]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>

      <template
        is="dom-if"
        if="[[_canAddDisaggregation(permissions)]]"
        restamp="true">
      <cluster-disaggregations-modal id="modal"></cluster-disaggregations-modal>

      <div id="action">
        <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
          [[localize('add_disaggregation')]]
        </paper-button>
      </div>
    </template>

      <clusters-disaggregations-list></clusters-disaggregations-list>
    </page-body>
  </template>
    `;
    }
    static get observers() {
        return [
            '_clusterDisaggregationsAjax(queryParams, disaggregationsUrl)'
        ];
    }
    _onSuccess() {
        this._clusterDisaggregationsAjax(this.queryParams);
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _computeUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.responseParametersClusterDisaggregations(responsePlanID);
    }
    _clusterDisaggregationsAjax(queryParams) {
        if (!this.disaggregationsUrl) {
            return;
        }
        this._clusterDisaggregationsAjaxDebouncer = Debouncer.debounce(this._clusterDisaggregationsAjaxDebouncer, timeOut.after(300), () => {
            const thunk = this.$.disaggregations.thunk();
            if (!Object.keys(queryParams).length) {
                return;
            }
            this.$.disaggregations.abort();
            this.reduxStore.dispatch(fetchClusterDisaggregationsList(thunk))
                // @ts-ignore
                .catch((_err) => {
                //   // TODO: error handling.
            });
        });
    }
    _canAddDisaggregation(permissions) {
        return permissions.createClusterEntities;
    }
    _addEventListeners() {
        this._onSuccess = this._onSuccess.bind(this);
        this.addEventListener('disaggregation-added', this._onSuccess);
    }
    _removeEventListeners() {
        this.removeEventListener('disaggregation-added', this._onSuccess);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
        if (this._clusterDisaggregationsAjaxDebouncer && this._clusterDisaggregationsAjaxDebouncer.isActive()) {
            this._clusterDisaggregationsAjaxDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], Disaggregations.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], Disaggregations.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanID)' })
], Disaggregations.prototype, "disaggregationsUrl", void 0);
window.customElements.define('clusters-disaggregations', Disaggregations);
export { Disaggregations as ClustersDisaggregationsEl };
