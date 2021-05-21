import {ReduxConnectedElement} from '../../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../../../../etools-prp-common/mixins/routing-mixin';
import SortingMixin from '../../../../../etools-prp-common/mixins/sorting-mixin';
import '../../../../../elements/cluster-reporting/response-parameters/partners/activities/filters';
import '../../../../../elements/cluster-reporting/planned-action/activities/creation-modal';
import '../../../../../elements/cluster-reporting/activity-list-table';
import {PlannedActionActivityModalEl} from '../../../../../elements/cluster-reporting/planned-action/activities/creation-modal';
import {EtoolsPrpAjaxEl} from '../../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../../etools-prp-common/elements/etools-prp-permissions';
import {sharedStyles} from '../../../../../etools-prp-common/styles/shared-styles';
import {buttonsStyles} from '../../../../../etools-prp-common/styles/buttons-styles';
import {fetchPartnerActivitiesList} from '../../../../../etools-prp-common/redux/actions/partnerActivities';
import {GenericObject} from '../../../../../etools-prp-common/typings/globals.types';
import Endpoints from '../../../../../etools-prp-common/endpoints';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin SortingMixin
 */
class RpPartnersActivities extends LocalizeMixin(RoutingMixin(SortingMixin(UtilsMixin(ReduxConnectedElement)))) {
  static get template() {
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

      <etools-prp-ajax id="partnerActivities" url="[[url]]" params="[[queryParams]]"> </etools-prp-ajax>

      <page-body>
        <partner-activities-filters></partner-activities-filters>
        <template is="dom-if" if="[[_canAddActivity(permissions, responsePlanCurrent)]]" restamp="true">
          <div id="action">
            <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
              [[localize('add_activity')]]
            </paper-button>
          </div>
          <planned-action-activity-modal id="modal"></planned-action-activity-modal>
        </template>

        <activity-list-table page="response-parameters"></activity-list-table>
      </page-body>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: String, computed: '_computeUrl(responsePlanID)'})
  url!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)'})
  responsePlanCurrent!: GenericObject;

  static get observers() {
    return ['_activitiesAjax(queryParams, url)'];
  }

  private _activitiesAjaxDebouncer!: Debouncer;

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as PlannedActionActivityModalEl).open();
  }

  _computeUrl(responsePlanID: string) {
    if (!responsePlanID) {
      return;
    }
    return Endpoints.partnerActivityList(responsePlanID);
  }

  _onSuccess(e: CustomEvent) {
    const path = '/response-parameters/partners/activity/' + String(e.detail.id);
    const url = this.buildUrl(this._baseUrlCluster, path);
    this.set('path', url);
  }

  _canAddActivity(permissions: GenericObject, responsePlanCurrent: GenericObject) {
    if (!permissions || !responsePlanCurrent) {
      return;
    }
    return permissions.createPartnerEntitiesByResponsePlan(responsePlanCurrent.clusters);
  }

  _activitiesAjax(queryParams: GenericObject) {
    if (!this.url || !queryParams) {
      return;
    }
    this._activitiesAjaxDebouncer = Debouncer.debounce(this._activitiesAjaxDebouncer, timeOut.after(300), () => {
      const thunk = (this.$.partnerActivities as EtoolsPrpAjaxEl).thunk();
      if (!Object.keys(queryParams).length) {
        return;
      }
      (this.$.partnerActivities as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(fetchPartnerActivitiesList(thunk))
        // @ts-ignore
        .catch((_err: GenericObject) => {
          //   // TODO: error handling.
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
    this._removeEventListeners();
    if (this._activitiesAjaxDebouncer && this._activitiesAjaxDebouncer.isActive()) {
      this._activitiesAjaxDebouncer.cancel();
    }
  }
}

window.customElements.define('rp-partners-activities', RpPartnersActivities);

export {RpPartnersActivities as RpPartnersActivitiesEl};
