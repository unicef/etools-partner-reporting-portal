var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../../etools-prp-ajax';
import '../../../../etools-prp-permissions';
import '../../../../page-body';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import Endpoints from '../../../../../endpoints';
import '../../../project-activity-table';
import '../../../planned-action/activities/add-activity-from-project-modal';
import '../../../planned-action/activities/add-existing-activity-from-project-modal';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import { partnerProjActivitiesFetch } from '../../../../../redux/actions/partnerProjects';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class Activities extends LocalizeMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement))) {
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

    <etools-prp-permissions
      permissions="{{permissions}}">
    </etools-prp-permissions>

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

      <template
          is="dom-if"
          if="[[_displayButtons(permissions)]]"
          restamp="true">
        <div id="action">
          <paper-button id="add_new_pa" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_new_project_activity')]]
          </paper-button>

          <paper-button id="add_existing_pa" on-tap="_openExistingModal" class="btn-primary" raised>
            [[localize('add_existing_project_activity')]]
          </paper-button>
        </div>
      </template>

      <project-activity-table
        page="response-parameters"
        project-id="[[projectId]]">
      </project-activity-table>
    </page-body>
    `;
    }
    static get observers() {
        return [
            '_activitiesByPartnerProjectIdAjax(queryParams)'
        ];
    }
    _onSuccess(e) {
        const data = e.detail;
        const path = '/response-parameters/partners/activity/' + String(data.id);
        const url = this.buildUrl(this._baseUrlCluster, path);
        this.set('path', url);
    }
    _displayButtons(permissions) {
        return !permissions.viewPlannedAction;
    }
    _activitiesByPartnerProjectIdAjax() {
        this.ActivitiesByPartnerDebouncer = Debouncer.debounce(this.ActivitiesByPartnerDebouncer, timeOut.after(100), () => {
            const thunk = this.$.activities.thunk();
            this.$.activities.abort();
            this.reduxStore.dispatch(partnerProjActivitiesFetch(thunk, this.projectId))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling.
            });
        });
    }
    _computeParams(queryParams, projectId) {
        return Object.assign({}, queryParams, {
            project: projectId
        });
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _openExistingModal() {
        this.shadowRoot.querySelector('#existing-modal').open();
    }
    _computeUrl(responsePlanId) {
        return Endpoints.partnerActivityList(responsePlanId);
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
        if (this.ActivitiesByPartnerDebouncer && this.ActivitiesByPartnerDebouncer.isActive) {
            this.ActivitiesByPartnerDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], Activities.prototype, "queryParams", void 0);
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
    property({ type: Object, computed: '_computeParams(queryParams, projectId)' })
], Activities.prototype, "params", void 0);
window.customElements.define('rp-partner-project-details-activities', Activities);
export { Activities as RpPartnerProjectDetailsActivitiesEl };
