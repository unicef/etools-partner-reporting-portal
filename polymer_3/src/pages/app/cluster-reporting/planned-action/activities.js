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
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import RoutingMixin from '../../../../mixins/routing-mixin';
import SortingMixin from '../../../../mixins/sorting-mixin';
import '../../../../elements/cluster-reporting/planned-action/activities/filters';
import '../../../../elements/cluster-reporting/planned-action/activities/creation-modal';
import '../../../../elements/cluster-reporting/activity-list-table';
import '../../../../elements/etools-prp-ajax';
import '../../../../elements/etools-prp-permissions';
import { sharedStyles } from '../../../../styles/shared-styles';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import Endpoints from '../../../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { fetchPartnerActivitiesList } from '../../../../redux/actions/partnerActivities';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin SortingMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionActivitiesList extends LocalizeMixin(SortingMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement)))) {
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
        id="plannedActionsActivities"
        url="[[url]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>
      <planned-action-activities-filters></planned-action-activities-filters>

      <template
          is="dom-if"
          if="[[permissions.editPlannedActionEntities]]"
          restamp="true">
        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_activity')]]
          </paper-button>
        </div>
      </template>

      <planned-action-activity-modal id="modal"></planned-action-activity-modal>

      <activity-list-table page="planned-action"></activity-list-table>
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
    _onSuccess(e) {
        const path = '/planned-action/activity/' + String(e.detail.id);
        const url = this.buildUrl(this._baseUrlCluster, path);
        this.set('path', url);
    }
    _computeUrl(responsePlanID) {
        if (!this.responsePlanID) {
            return;
        }
        return Endpoints.partnerActivityList(responsePlanID);
    }
    _activitiesAjax(queryParams) {
        if (!this.url) {
            return;
        }
        const self = this;
        this.activitiesDebouncer = Debouncer.debounce(this.activitiesDebouncer, timeOut.after(300), () => {
            queryParams.partner = self.partnerID;
            if (!Object.keys(queryParams).length) {
                return;
            }
            const dataThunk = this.$.plannedActionsActivities.thunk();
            self.$.plannedActionsActivities.abort();
            self.reduxStore.dispatch(fetchPartnerActivitiesList(dataThunk))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling
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
        if (this.activitiesDebouncer && this.activitiesDebouncer.isActive()) {
            this.activitiesDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], PlannedActionActivitiesList.prototype, "permissions", void 0);
__decorate([
    property({ type: Object })
], PlannedActionActivitiesList.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], PlannedActionActivitiesList.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: String })
], PlannedActionActivitiesList.prototype, "path", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.partner.current.id)' })
], PlannedActionActivitiesList.prototype, "partnerID", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanID, queryParams, partnerID)' })
], PlannedActionActivitiesList.prototype, "url", void 0);
window.customElements.define('planned-action-activities-list', PlannedActionActivitiesList);
