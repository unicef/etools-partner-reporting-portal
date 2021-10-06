var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import SortingMixin from '../../../../../mixins/sorting-mixin';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/activities/filters';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/activities/creation-modal';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/activities/activities-list';
import '../../../../../elements/etools-prp-permissions';
import { tableStyles } from '../../../../../styles/table-styles';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import Endpoints from '../../../../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { fetchClusterActivitiesList } from '../../../../../redux/actions/clusterActivities';
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin RoutingMixin
* @appliesMixin SortingMixin
*/
class Activities extends LocalizeMixin(UtilsMixin(RoutingMixin(SortingMixin(ReduxConnectedElement)))) {
    static get template() {
        return html `
    ${tableStyles} ${buttonsStyles}
    <style include="data-table-styles">
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
        id="activities"
        url="[[activitiesUrl]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>
      <cluster-activities-filters></cluster-activities-filters>

      <template
          is="dom-if"
          if="[[permissions.createClusterEntities]]"
          restamp="true">
        <cluster-activities-modal id="modal"></cluster-activities-modal>

        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_cluster_activity')]]
          </paper-button>
        </div>
      </template>

      <clusters-activities-list></clusters-activities-list>
    </page-body>
    `;
    }
    static get observers() {
        return [
            '_clusterActivitiesAjax(queryParams, activitiesUrl)'
        ];
    }
    _computeUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.responseParametersClusterActivities(responsePlanID);
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _clusterActivitiesAjax() {
        if (!this.activitiesUrl) {
            return;
        }
        this._clusterActivitiesAjaxDebouncer = Debouncer.debounce(this._clusterActivitiesAjaxDebouncer, timeOut.after(300), () => {
            const thunk = this.$.activities.thunk();
            this.$.activities.abort();
            this.reduxStore.dispatch(fetchClusterActivitiesList(thunk))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling.
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._clusterActivitiesAjaxDebouncer && this._clusterActivitiesAjaxDebouncer.isActive()) {
            this._clusterActivitiesAjaxDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], Activities.prototype, "permissions", void 0);
__decorate([
    property({ type: Object })
], Activities.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanID)' })
], Activities.prototype, "activitiesUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], Activities.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.clusterActivities.loading)' })
], Activities.prototype, "loading", void 0);
__decorate([
    property({ type: Array, computed: 'getReduxStateArray(rootState.clusterActivities.all)' })
], Activities.prototype, "activities", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterActivities.count)' })
], Activities.prototype, "totalResults", void 0);
window.customElements.define('clusters-activities', Activities);
export { Activities as ClustersActivitiesEl };
