import {ReduxConnectedElement} from '../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../../../etools-prp-common/mixins/routing-mixin';
import SortingMixin from '../../../../etools-prp-common/mixins/sorting-mixin';
import '../../../../elements/cluster-reporting/planned-action/activities/filters';
import '../../../../elements/cluster-reporting/planned-action/activities/creation-modal';
import '../../../../elements/cluster-reporting/activity-list-table';
import '../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../etools-prp-common/elements/etools-prp-permissions';
import {sharedStyles} from '../../../../etools-prp-common/styles/shared-styles';
import {buttonsStyles} from '../../../../etools-prp-common/styles/buttons-styles';
import {GenericObject} from '../../../../etools-prp-common/typings/globals.types';
import Endpoints from '../../../../endpoints';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-common/elements/etools-prp-ajax';
import {fetchPartnerActivitiesList} from '../../../../redux/actions/partnerActivities';
import {PlannedActionActivityModalEl} from '../../../../elements/cluster-reporting/planned-action/activities/creation-modal';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin SortingMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionActivitiesList extends LocalizeMixin(SortingMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement)))) {
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

      <iron-location query="{{query}}" path="{{path}}"></iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="plannedActionsActivities" url="[[url]]" params="[[queryParams]]"> </etools-prp-ajax>

      <page-body>
        <planned-action-activities-filters></planned-action-activities-filters>

        <template is="dom-if" if="[[permissions.editPlannedActionEntities]]" restamp="true">
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
    return ['_activitiesAjax(queryParams, url)'];
  }

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: String})
  path!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.partner.current.id)'})
  partnerID!: string;

  @property({type: String, computed: '_computeUrl(responsePlanID, queryParams, partnerID)'})
  url!: string;

  activitiesDebouncer!: Debouncer;

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as PlannedActionActivityModalEl).open();
  }

  _onSuccess(e: CustomEvent) {
    const path = '/planned-action/activity/' + String(e.detail.id);
    const url = this.buildUrl(this._baseUrlCluster, path);
    this.set('path', url);
  }

  _computeUrl(responsePlanID: string) {
    if (!this.responsePlanID) {
      return;
    }
    return Endpoints.partnerActivityList(responsePlanID);
  }

  _activitiesAjax(queryParams: GenericObject) {
    if (!this.url) {
      return;
    }

    this.activitiesDebouncer = Debouncer.debounce(this.activitiesDebouncer, timeOut.after(300), () => {
      queryParams.partner = this.partnerID;
      if (!Object.keys(queryParams).length) {
        return;
      }

      const dataThunk = (this.$.plannedActionsActivities as EtoolsPrpAjaxEl).thunk();

      (this.$.plannedActionsActivities as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(fetchPartnerActivitiesList(dataThunk))
        // @ts-ignore
        .catch((_err: any) => {
          // TODO: error handling
        });
    });
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
    if (this.activitiesDebouncer && this.activitiesDebouncer.isActive()) {
      this.activitiesDebouncer.cancel();
    }
  }
}
window.customElements.define('planned-action-activities-list', PlannedActionActivitiesList);
