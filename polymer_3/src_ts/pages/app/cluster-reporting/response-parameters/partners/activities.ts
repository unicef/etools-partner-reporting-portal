import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import SortingMixin from '../../../../../mixins/sorting-mixin';

import '../../../../../elements/cluster-reporting/response-parameters/partners/activities/filters';
import '../../../../../elements/cluster-reporting/planned-action/activities/creation-modal';
import '../../../../../elements/cluster-reporting/activity-list-table';
import {PlannedActionActivityModalEl} from '../../../../../elements/cluster-reporting/planned-action/activities/creation-modal';
import {EtoolsPrpAjaxEl} from '../../../../../elements/etools-prp-ajax';
import '../../../../../elements/etools-prp-permissions';

import {tableStyles} from '../../../../../styles/table-styles';
import {buttonsStyles} from '../../../../../styles/buttons-styles';
import {fetchPartnerActivitiesList} from '../../../../../redux/actions/partnerActivities';
import {GenericObject} from '../../../../../typings/globals.types';
import Endpoints from '../../../../../endpoints';
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
class RpPartnersActivities extends LocalizeMixin(UtilsMixin(RoutingMixin(SortingMixin(ReduxConnectedElement)))) {

  static get template() {
    return html`
    ${tableStyles} ${buttonsStyles}
    <style include="data-table-styles">
      :host {
        display: block;
      }

      div#action {
        margin: 25px 0;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }

      a {
        color: var(--theme-primary-color);
      }
    </style>

    <etools-prp-permissions
      permissions="{{permissions}}">
    </etools-prp-permissions>

    <iron-location query="{{query}}" path="{{path}}"></iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="partnerActivities"
        url="[[url]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>
      <cluster-activities-filters></cluster-activities-filters>

      <template
          is="dom-if"
          if="[[permissions.createClusterEntities]]"
          restamp="true">
        <cluster-activities-modal id="modal"></cluster-activities-modal>

        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_cluster_activity')]]
          </paper-button>
        </div>
      </template>

      <clusters-activities-list></clusters-activities-list>
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
    return [
      '_activitiesAjax(queryParams, url)'
    ]
  }

  private _activitiesAjaxDebouncer!: Debouncer;

  _openModal() {
    //CreationModalEl is imported
    //TO DO: if not refactored yet, refactor export line of CreationModal => change name
    // this.shadowRoot.querySelector('#modal').open();
    (this.shadowRoot!.querySelector('#modal') as PlannedActionActivityModalEl).open();
  }

  _computeUrl(responsePlanID: string) {
    if (!responsePlanID) {
      return;
    }
    return Endpoints.partnerActivityList(responsePlanID);
  }

  _onSuccess(e: CustomEvent) {
    var path = '/response-parameters/partners/activity/' + String(e.detail.id);
    var url = this.buildUrl(this._baseUrlCluster, path);
    this.set('path', url);
  }

  _canAddActivity(permissions: GenericObject, responsePlanCurrent: GenericObject) {
    if (responsePlanCurrent) {
      return permissions.createPartnerEntitiesByResponsePlan(responsePlanCurrent.clusters);
    }
  }

  _activitiesAjax(queryParams: GenericObject) {
    if (!this.url || !queryParams) {
      return;
    }
    const self = this;
    this._activitiesAjaxDebouncer = Debouncer.debounce(this._activitiesAjaxDebouncer,
      timeOut.after(300),
      () => {
        const thunk = (self.$.partnerActivities as EtoolsPrpAjaxEl).thunk();
        if (!Object.keys(queryParams).length) {
          return;
        }
        (self.$.partnerActivities as EtoolsPrpAjaxEl).abort();

        self.reduxStore.dispatch(fetchPartnerActivitiesList(thunk))
          // @ts-ignore
          .catch(function(err) {
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
    // (dci) need to check if it's working on original
    // this._getObjectiveAjax();
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
