import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-query-params';
import '@polymer/iron-location/iron-location';
import '../../../page-body';
import '../../../etools-prp-ajax';
import UtilsMixin from '../../../../mixins/utils-mixin';
import Endpoints from '../../../../endpoints';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import '../../project-activity-table';
import '../activities/add-activity-from-project-modal';
import '../activities/add-existing-activity-from-project-modal';
import {EtoolsPrpAjaxEl} from '../../../../elements/etools-prp-ajax';
import {partnerProjActivitiesFetch} from '../../../../redux/actions/partnerProjects';
import {PlannedActioAddExistingActivityFromProjectModalEl} from '../activities/add-existing-activity-from-project-modal';
import {PlannedActionAddActivityFromProjectModalEl} from '../activities/add-activity-from-project-modal';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class Activities extends UtilsMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style include="button-styles">
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
    let path = '/planned-action/activity/' + String(e.detail.id);
    let url = this.buildUrl(this._baseUrlCluster, path);
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
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(100), () => {

        let thunk = (this.$.activities as EtoolsPrpAjaxEl).thunk();

        (this.$.activities as EtoolsPrpAjaxEl).abort();

        this.reduxStore.dispatch(partnerProjActivitiesFetch(thunk, this.projectId))
          // @ts-ignore
          .catch(function(err) {
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
    this.addEventListener('modal.activity-added', this._onSuccess as any);
  }

  _removeEventListeners() {
    this.removeEventListener('modal.activity-added', this._onSuccess as any);
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
