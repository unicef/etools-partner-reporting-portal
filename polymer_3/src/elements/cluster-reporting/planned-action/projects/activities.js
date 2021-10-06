var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-location/iron-location';
import '../../../page-body';
import '../../../etools-prp-ajax';
import UtilsMixin from '../../../../mixins/utils-mixin';
import RoutingMixin from '../../../../mixins/routing-mixin';
import Endpoints from '../../../../endpoints';
import { property } from '@polymer/decorators/lib/decorators';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import '../../project-activity-table';
import '../activities/add-activity-from-project-modal';
import '../activities/add-existing-activity-from-project-modal';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import { partnerProjActivitiesFetch } from '../../../../redux/actions/partnerProjects';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class Activities extends RoutingMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
      ${buttonsStyles}
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

      <iron-location query="{{query}}" path="{{path}}"></iron-location>

      <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
      </iron-query-params>

      <etools-prp-ajax
        id="activities"
        url="[[url]]"
        params="[[params]]">
      </etools-prp-ajax>

      <page-body>
        <planned-action-add-activity-from-project-modal id="modal" project-data="[[projectData]]"></planned-action-add-activity-from-project-modal>
        <planned-action-add-existing-activity-from-project-modal id="existing-modal" project-data="[[projectData]]"></planned-action-add-existing-activity-from-project-modal>

        <div id="action">
          <paper-button id="add_new_pa" on-tap="_openModal" class="btn-primary" raised>
            Add New Project Activity
          </paper-button>

          <paper-button id="add_existing_pa" on-tap="_openExistingModal" class="btn-primary" raised>
            Add Existing Project Activity
          </paper-button>
        </div>

        <project-activity-table
          page="planned-action"
          project-id="[[projectId]]">
        </project-activity-table>
      </page-body>
    `;
    }
    static get observers() {
        return ['_activitiesByPartnerProjectIdAjax(url, params)'];
    }
    _onSuccess(e) {
        const path = '/planned-action/activity/' + String(e.detail.id);
        const url = this.buildUrl(this._baseUrlCluster, path);
        this.set('path', url);
    }
    _computeUrl(responsePlanId) {
        if (!responsePlanId) {
            return;
        }
        return Endpoints.partnerActivityList(responsePlanId);
    }
    _computeParams(queryParams) {
        delete queryParams.cluster_id; // Need to remove cluster_id property in order to get all activities
        return Object.assign({}, queryParams, {
            project: this.projectId
        });
    }
    _activitiesByPartnerProjectIdAjax() {
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(100), () => {
            const thunk = this.$.activities.thunk();
            this.$.activities.abort();
            this.reduxStore.dispatch(partnerProjActivitiesFetch(thunk, this.projectId))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling.
            });
        });
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _openExistingModal() {
        this.shadowRoot.querySelector('#existing-modal').open();
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
    }
}
__decorate([
    property({ type: Object })
], Activities.prototype, "queryParams", void 0);
__decorate([
    property({ type: String })
], Activities.prototype, "path", void 0);
__decorate([
    property({ type: Number })
], Activities.prototype, "projectId", void 0);
__decorate([
    property({ type: Object })
], Activities.prototype, "projectData", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], Activities.prototype, "responsePlanId", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanId)' })
], Activities.prototype, "url", void 0);
__decorate([
    property({ type: Object, computed: '_computeParams(queryParams)' })
], Activities.prototype, "params", void 0);
window.customElements.define('pa-project-details-activities', Activities);
