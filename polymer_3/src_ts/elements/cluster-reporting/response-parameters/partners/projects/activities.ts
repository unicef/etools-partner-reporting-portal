import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-ajax';
import '../../../../etools-prp-permissions';
import '../../../../page-body';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import Endpoints from '../../../../../endpoints';
import '../../../project-activity-table';
import '../../../planned-action/activities/add-activity-from-project-modal';
import '../../../planned-action/activities/add-existing-activity-from-project-modal';
import {buttonsStyles} from '../../../../../styles/buttons-styles';

import {partnerProjActivitiesFetch} from '../../../../../redux/actions/partnerProjects';
import {GenericObject} from '../../../../../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {PlannedActionAddActivityFromProjectModalEl} from "../../../planned-action/activities/add-activity-from-project-modal";
import {PlannedActioAddExistingActivityFromProjectModalEl} from "../../../planned-action/activities/add-existing-activity-from-project-modal";

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class Activities extends LocalizeMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement))) {
  public static get template() {
    return html`
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

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Number})
  projectId!: number;

  @property({type: Object})
  projectData!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String, computed: '_computeUrl(responsePlanId)'})
  url!: string;

  @property({type: Object, computed: '_computeParams(queryParams, projectId)'})
  params!: GenericObject;

  static get observers() {
    return [
      '_activitiesByPartnerProjectIdAjax(queryParams)'
    ];
  }

  private ActivitiesByPartnerDebouncer!: Debouncer;

  _onSuccess(e: CustomEvent) {
    const data = e.detail;
    const path = '/response-parameters/partners/activity/' + String(data.id);
    const url = this.buildUrl(this._baseUrlCluster, path);
    this.set('path', url);
  }

  _displayButtons(permissions: GenericObject) {
    return !permissions.viewPlannedAction;
  }

  _activitiesByPartnerProjectIdAjax() {
    this.ActivitiesByPartnerDebouncer = Debouncer.debounce(this.ActivitiesByPartnerDebouncer,
      timeOut.after(100),
      () => {
        const thunk = (this.$.activities as EtoolsPrpAjaxEl).thunk();

        (this.$.activities as EtoolsPrpAjaxEl).abort();

        this.reduxStore.dispatch(partnerProjActivitiesFetch(thunk, this.projectId))
          // @ts-ignore
          .catch((_err: any) => {
            // TODO: error handling.
          });
      });
  }

  _computeParams(queryParams: string, projectId: number) {
    return Object.assign({}, queryParams, {
      project: projectId
    });
  }

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as PlannedActionAddActivityFromProjectModalEl).open();
  }

  _openExistingModal() {
    (this.shadowRoot!.querySelector('#existing-modal') as PlannedActioAddExistingActivityFromProjectModalEl).open();
  }

  _computeUrl(responsePlanId: string) {
    return Endpoints.partnerActivityList(responsePlanId);
  }

  _addEventListeners() {
    this._onSuccess = this._onSuccess.bind(this);
    this.addEventListener('activity-added', this._onSuccess as any);
  }

  _removeEventListeners() {
    this.removeEventListener('activity-added', this._onSuccess as any);
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

window.customElements.define('rp-partner-project-details-activities', Activities);

export {Activities as RpPartnerProjectDetailsActivitiesEl};
