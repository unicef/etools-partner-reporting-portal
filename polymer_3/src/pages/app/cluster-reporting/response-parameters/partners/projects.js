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
import '../../../../../elements/cluster-reporting/response-parameters/partners/projects/filters';
import '../../../../../elements/cluster-reporting/planned-action/projects/creation-modal';
import '../../../../../elements/cluster-reporting/project-list-table';
import '../../../../../elements/etools-prp-permissions';
import { sharedStyles } from '../../../../../styles/shared-styles';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import Endpoints from '../../../../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { fetchPartnerProjectsList } from '../../../../../redux/actions/partnerProjects';
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin RoutingMixin
* @appliesMixin SortingMixin
*/
class Projects extends LocalizeMixin(UtilsMixin(RoutingMixin(SortingMixin(ReduxConnectedElement)))) {
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

      <partner-projects-filters></partner-projects-filters>

      <template
        is="dom-if"
        if="[[_canAddProject(permissions, responsePlanCurrent)]]"
        restamp="true">
        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_project')]]
          </paper-button>
        </div>
        <planned-action-projects-modal id="modal"></planned-action-projects-modal>
      </template>

      <project-list-table page="response-parameters"></project-list-table>

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
            return permissions.addPartnerToProject;
        }
        return false;
    }
    _projectsAjax(queryParams) {
        if (!this.url || !queryParams) {
            return;
        }
        this._projectsAjaxDebouncer = Debouncer.debounce(this._projectsAjaxDebouncer, timeOut.after(300), () => {
            const thunk = this.$.plannedActionsProjects.thunk();
            if (!Object.keys(queryParams).length) {
                return;
            }
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
        if (this._projectsAjaxDebouncer && this._projectsAjaxDebouncer.isActive()) {
            this._projectsAjaxDebouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Object })
], Projects.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)' })
], Projects.prototype, "responsePlanID", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(responsePlanID)' })
], Projects.prototype, "url", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)' })
], Projects.prototype, "responsePlanCurrent", void 0);
window.customElements.define('rp-partners-projects', Projects);
export { Projects as RpPartnersProjectsEl };
