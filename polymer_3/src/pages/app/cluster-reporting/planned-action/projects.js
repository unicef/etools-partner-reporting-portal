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
import '../../../../elements/etools-prp-ajax';
import '../../../../elements/etools-prp-permissions';
import Endpoints from '../../../../endpoints';
import '../../../../elements/cluster-reporting/planned-action/projects/filters';
import '../../../../elements/cluster-reporting/planned-action/projects/creation-modal';
import '../../../../elements/cluster-reporting/project-list-table';
import { sharedStyles } from '../../../../styles/shared-styles';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { fetchPartnerProjectsList } from '../../../../redux/actions/partnerProjects';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin SortingMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionProjectsList extends LocalizeMixin(SortingMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement)))) {
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

      <iron-location query="{{query}}"></iron-location>

      <iron-query-params
          params-string="{{query}}"
          params-object="{{queryParams}}">
      </iron-query-params>

      <etools-prp-ajax
          id="plannedActionsProjects"
          url="[[url]]"
          params="[[queryParams]]">
      </etools-prp-ajax>

      <page-body>
        <planned-action-projects-filters></planned-action-projects-filters>


        <template
            is="dom-if"
            if="[[_canAddProject(permissions, responsePlanCurrent)]]"
            restamp="true">
          <div id="action">
            <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
              [[localize('add_project')]]
            </paper-button>
          </div>
        </template>

        <planned-action-projects-modal id="modal"></planned-action-projects-modal>

        <project-list-table page="planned-action"></project-list-table>
      </page-body>
  `;
    }
    static get observers() {
        return [
            '_projectsAjax(queryParams, url)'
        ];
    }
    _openModal() {
        this.shadowRoot.querySelector('#modal').open();
    }
    _computeUrl(responsePlanID) {
        if (!responsePlanID) {
            return;
        }
        return Endpoints.plannedActions(responsePlanID);
    }
    _canAddProject(permissions, responsePlanCurrent) {
        if (responsePlanCurrent && permissions) {
            return permissions.addPlannedActionProject;
        }
        return false;
    }
    _projectsAjax(queryParams) {
        if (!this.url) {
            return;
        }
        this.projectsDebouncer = Debouncer.debounce(this.projectsDebouncer, timeOut.after(300), () => {
            queryParams.partner = this.partnerID;
            if (!Object.keys(queryParams).length) {
                return;
            }
            const thunk = this.$.plannedActionsProjects.thunk();
            this.$.plannedActionsProjects.abort();
            this.reduxStore.dispatch(fetchPartnerProjectsList(thunk))
                // @ts-ignore
                .catch((_err) => {
                // TODO: error handling.
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.projectsDebouncer && this.projectsDebouncer.isActive()) {
            this.projectsDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], PlannedActionProjectsList.prototype, "permissions", void 0);
__decorate([
    property({ type: Object })
], PlannedActionProjectsList.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], PlannedActionProjectsList.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.partner.current.id)' })
], PlannedActionProjectsList.prototype, "partnerID", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanID, queryParams, partnerID)' })
], PlannedActionProjectsList.prototype, "url", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)' })
], PlannedActionProjectsList.prototype, "responsePlanCurrent", void 0);
window.customElements.define('planned-action-projects-list', PlannedActionProjectsList);
