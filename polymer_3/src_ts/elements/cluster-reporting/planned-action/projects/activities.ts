import {ReduxConnectedElement} from '../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-location/iron-location';
import '../../../../etools-prp-common/elements/page-body';
import '../../../../etools-prp-common/elements/etools-prp-ajax';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
import RoutingMixin from '../../../../etools-prp-common/mixins/routing-mixin';
import Endpoints from '../../../../etools-prp-common/endpoints';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../etools-prp-common/typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import '../../project-activity-table';
import '../activities/add-activity-from-project-modal';
import '../activities/add-existing-activity-from-project-modal';
import {buttonsStyles} from '../../../../etools-prp-common/styles/buttons-styles';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-common/elements/etools-prp-ajax';
import {partnerProjActivitiesFetch} from '../../../../etools-prp-common/redux/actions/partnerProjects';
import {PlannedActionAddActivityFromProjectModalEl} from '../activities/add-activity-from-project-modal';
import {PlannedActioAddExistingActivityFromProjectModalEl} from '../activities/add-existing-activity-from-project-modal';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class Activities extends RoutingMixin(UtilsMixin(ReduxConnectedElement)) {
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

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="activities" url="[[url]]" params="[[params]]"> </etools-prp-ajax>

      <page-body>
        <planned-action-add-activity-from-project-modal
          id="modal"
          project-data="[[projectData]]"
        ></planned-action-add-activity-from-project-modal>
        <planned-action-add-existing-activity-from-project-modal
          id="existing-modal"
          project-data="[[projectData]]"
        ></planned-action-add-existing-activity-from-project-modal>

        <div id="action">
          <paper-button id="add_new_pa" on-tap="_openModal" class="btn-primary" raised>
            Add New Project Activity
          </paper-button>

          <paper-button id="add_existing_pa" on-tap="_openExistingModal" class="btn-primary" raised>
            Add Existing Project Activity
          </paper-button>
        </div>

        <project-activity-table page="planned-action" project-id="[[projectId]]"> </project-activity-table>
      </page-body>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String})
  path!: string;

  @property({type: Number})
  projectId!: number;

  @property({type: Object})
  projectData!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String, computed: '_computeUrl(responsePlanId)'})
  url!: string;

  @property({type: Object, computed: '_computeParams(queryParams)'})
  params!: GenericObject;

  private _debouncer!: Debouncer;

  static get observers() {
    return ['_activitiesByPartnerProjectIdAjax(url, params)'];
  }

  _onSuccess(e: CustomEvent) {
    const path = '/planned-action/activity/' + String(e.detail.id);
    const url = this.buildUrl(this._baseUrlCluster, path);
    this.set('path', url);
  }

  _computeUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.partnerActivityList(responsePlanId);
  }

  _computeParams(queryParams: GenericObject) {
    delete queryParams.cluster_id; // Need to remove cluster_id property in order to get all activities

    return Object.assign({}, queryParams, {
      project: this.projectId
    });
  }

  _activitiesByPartnerProjectIdAjax() {
    this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(100), () => {
      const thunk = (this.$.activities as EtoolsPrpAjaxEl).thunk();

      (this.$.activities as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(partnerProjActivitiesFetch(thunk, this.projectId))
        // @ts-ignore
        .catch((_err: GenericObject) => {
          // TODO: error handling.
        });
    });
  }

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as PlannedActionAddActivityFromProjectModalEl).open();
  }

  _openExistingModal() {
    (this.shadowRoot!.querySelector('#existing-modal') as PlannedActioAddExistingActivityFromProjectModalEl).open();
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
  }
}

window.customElements.define('pa-project-details-activities', Activities);
