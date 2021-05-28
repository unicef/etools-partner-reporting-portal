import {ReduxConnectedElement} from '../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../../../etools-prp-common/mixins/routing-mixin';
import SortingMixin from '../../../../etools-prp-common/mixins/sorting-mixin';
import '../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../etools-prp-common/elements/etools-prp-permissions';
import Endpoints from '../../../../endpoints';
import '../../../../elements/cluster-reporting/planned-action/projects/filters';
import '../../../../elements/cluster-reporting/planned-action/projects/creation-modal';
import {PlannedActionProjectsModalEl} from '../../../../elements/cluster-reporting/planned-action/projects/creation-modal';
import '../../../../elements/cluster-reporting/project-list-table';
import {sharedStyles} from '../../../../etools-prp-common/styles/shared-styles';
import {buttonsStyles} from '../../../../etools-prp-common/styles/buttons-styles';
import {GenericObject} from '../../../../etools-prp-common/typings/globals.types';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-common/elements/etools-prp-ajax';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {fetchPartnerProjectsList} from '../../../../redux/actions/partnerProjects';
import {timeOut} from '@polymer/polymer/lib/utils/async';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin SortingMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionProjectsList extends LocalizeMixin(SortingMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement)))) {
  public static get template() {
    return html`
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

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <iron-location query="{{query}}"></iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="plannedActionsProjects" url="[[url]]" params="[[queryParams]]"> </etools-prp-ajax>

      <page-body>
        <planned-action-projects-filters></planned-action-projects-filters>

        <template is="dom-if" if="[[_canAddProject(permissions, responsePlanCurrent)]]" restamp="true">
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
    return ['_projectsAjax(queryParams, url)'];
  }

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.partner.current.id)'})
  partnerID!: string;

  @property({type: String, computed: '_computeUrl(responsePlanID, queryParams, partnerID)'})
  url!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)'})
  responsePlanCurrent!: GenericObject;

  projectsDebouncer!: Debouncer;

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as PlannedActionProjectsModalEl).open();
  }

  _computeUrl(responsePlanID: string) {
    if (!responsePlanID) {
      return;
    }
    return Endpoints.plannedActions(responsePlanID);
  }

  _canAddProject(permissions: GenericObject, responsePlanCurrent: GenericObject) {
    if (responsePlanCurrent && permissions) {
      return permissions.addPlannedActionProject;
    }
    return false;
  }

  _projectsAjax(queryParams: GenericObject) {
    if (!this.url) {
      return;
    }

    this.projectsDebouncer = Debouncer.debounce(this.projectsDebouncer, timeOut.after(300), () => {
      queryParams.partner = this.partnerID;
      if (!Object.keys(queryParams).length) {
        return;
      }

      const thunk = (this.$.plannedActionsProjects as EtoolsPrpAjaxEl).thunk();
      (this.$.plannedActionsProjects as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(fetchPartnerProjectsList(thunk))
        // @ts-ignore
        .catch((_err: GenericObject) => {
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

window.customElements.define('planned-action-projects-list', PlannedActionProjectsList);
