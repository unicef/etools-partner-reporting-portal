var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import '../../../../page-body';
import '../../../response-parameters/clusters/activities/activities-list';
import '../../../response-parameters/clusters/activities/filters';
import { tableStyles } from '../../../../../styles/table-styles';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { fetchClusterActivitiesList } from '../../../../../redux/actions/clusterActivities';
import Endpoints from '../../../../../endpoints';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class Activitites extends UtilsMixin(ReduxConnectedElement) {
    static get template() {
        // language=HTML
        return html `
    ${tableStyles}
    <style include="data-table-styles">
      :host {
        display: block;
      }
    </style>

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
      <cluster-activities-filters class="filters"></cluster-activities-filters>

      <clusters-activities-list is-minimal-list></clusters-activities-list>
    </page-body>
    `;
    }
    _updateParams(objectiveId) {
        setTimeout(() => {
            this.set('queryParams.cluster_objective_id', objectiveId);
        });
    }
    _clusterActivitiesAjax(queryParams) {
        this._clusterActivityDebouncer = Debouncer.debounce(this._clusterActivityDebouncer, timeOut.after(100), () => {
            const thunk = this.$.activities.thunk();
            if (typeof queryParams.cluster_objective_id === 'undefined') {
                return;
            }
            this.$.activities.abort();
            this.reduxStore.dispatch(fetchClusterActivitiesList(thunk))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling.
            });
        });
    }
    _computeActivitiesUrl() {
        if (this.responsePlanID) {
            return Endpoints.responseParametersClusterActivities(this.responsePlanID);
        }
        return '';
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._clusterActivityDebouncer && this._clusterActivityDebouncer.isActive()) {
            this._clusterActivityDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], Activitites.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: String, observer: '_updateParams' })
], Activitites.prototype, "objectiveId", void 0);
__decorate([
    property({ type: Object, observer: '_clusterActivitiesAjax' })
], Activitites.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: '_computeActivitiesUrl(queryParams, objectiveId, responsePlanID)' })
], Activitites.prototype, "activitiesUrl", void 0);
window.customElements.define('rp-clusters-details-activities', Activitites);
export { Activitites as RpClustersDetailsActivititesEl };
