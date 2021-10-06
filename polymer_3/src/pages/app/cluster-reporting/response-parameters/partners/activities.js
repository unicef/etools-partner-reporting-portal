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
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import SortingMixin from '../../../../../mixins/sorting-mixin';
import '../../../../../elements/cluster-reporting/response-parameters/partners/activities/filters';
import '../../../../../elements/cluster-reporting/planned-action/activities/creation-modal';
import '../../../../../elements/cluster-reporting/activity-list-table';
import '../../../../../elements/etools-prp-permissions';
import { sharedStyles } from '../../../../../styles/shared-styles';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import { fetchPartnerActivitiesList } from '../../../../../redux/actions/partnerActivities';
import Endpoints from '../../../../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin RoutingMixin
* @appliesMixin SortingMixin
*/
class RpPartnersActivities extends LocalizeMixin(RoutingMixin(SortingMixin(UtilsMixin(ReduxConnectedElement)))) {
    static get template() {
        return html `
    ${sharedStyles} ${buttonsStyles}
    <style>
      :host {
        display: block;
      }
      div#action {
        margin: 25px 0;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }
    </style>

    <etools-prp-permissions
      permissions="{{permissions}}">
    </etools-prp-permissions>

    <iron-location query="{{query}}" path="{{path}}"></iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="partnerActivities"
        url="[[url]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>

      <partner-activities-filters></partner-activities-filters>
      <template
        is="dom-if"
        if="[[_canAddActivity(permissions, responsePlanCurrent)]]"
        restamp="true">
        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_activity')]]
          </paper-button>
        </div>
        <planned-action-activity-modal id="modal"></planned-action-activity-modal>
      </template>

      <activity-list-table page="response-parameters"></activity-list-table>

    </page-body>
    `;
    }
    static get observers() {
        return [
            '_activitiesAjax(queryParams, url)'
        ];
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _computeUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.partnerActivityList(responsePlanID);
    }
    _onSuccess(e) {
        const path = '/response-parameters/partners/activity/' + String(e.detail.id);
        const url = this.buildUrl(this._baseUrlCluster, path);
        this.set('path', url);
    }
    _canAddActivity(permissions, responsePlanCurrent) {
        if (!permissions || !responsePlanCurrent) {
            return;
        }
        return permissions.createPartnerEntitiesByResponsePlan(responsePlanCurrent.clusters);
    }
    _activitiesAjax(queryParams) {
        if (!this.url || !queryParams) {
            return;
        }
        const self = this;
        this._activitiesAjaxDebouncer = Debouncer.debounce(this._activitiesAjaxDebouncer, timeOut.after(300), () => {
            const thunk = self.$.partnerActivities.thunk();
            if (!Object.keys(queryParams).length) {
                return;
            }
            self.$.partnerActivities.abort();
            self.reduxStore.dispatch(fetchPartnerActivitiesList(thunk))
                // @ts-ignore
                .catch((_err) => {
                //   // TODO: error handling.
            });
        });
    }
    _addEventListeners() {
        this._onSuccess = this._onSuccess.bind(this);
        this.addEventListener('activity-added', this._onSuccess);
    }
    _removeEventListeners() {
        this.removeEventListener('activity-added', this._onSuccess);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
        if (this._activitiesAjaxDebouncer && this._activitiesAjaxDebouncer.isActive()) {
            this._activitiesAjaxDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], RpPartnersActivities.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], RpPartnersActivities.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanID)' })
], RpPartnersActivities.prototype, "url", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)' })
], RpPartnersActivities.prototype, "responsePlanCurrent", void 0);
window.customElements.define('rp-partners-activities', RpPartnersActivities);
export { RpPartnersActivities as RpPartnersActivitiesEl };
