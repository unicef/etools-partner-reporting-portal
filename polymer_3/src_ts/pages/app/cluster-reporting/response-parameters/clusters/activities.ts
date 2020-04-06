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
import '../../../../../elements/cluster-reporting/response-parameters/clusters/activities/filters';
import {CreationModalActivitiesEl} from
  '../../../../../elements/cluster-reporting/response-parameters/clusters/activities/creation-modal';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/activities/creation-modal';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/activities/activities-list';
import {EtoolsPrpAjaxEl} from '../../../../../elements/etools-prp-ajax';
import '../../../../../elements/etools-prp-permissions';
import {tableStyles} from '../../../../../styles/table-styles';
import {buttonsStyles} from '../../../../../styles/buttons-styles';
import {GenericObject} from '../../../../../typings/globals.types';
import Endpoints from '../../../../../endpoints';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {fetchClusterActivitiesList} from '../../../../../redux/actions/clusterActivities';

/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin RoutingMixin
* @appliesMixin SortingMixin
*/
class Activities extends LocalizeMixin(UtilsMixin(RoutingMixin(SortingMixin(ReduxConnectedElement)))) {

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

    <iron-location query="{{query}}"></iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="activities"
        url="[[activitiesUrl]]"
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
  permissions!: GenericObject;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: '_computeUrl(responsePlanID)'})
  activitiesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.clusterActivities.loading)'})
  loading!: boolean;

  @property({type: Array, computed: 'getReduxStateArray(rootState.clusterActivities.all)'})
  activities!: GenericObject[];

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterActivities.count)'})
  totalResults!: number;

  static get observers() {
    return [
      '_clusterActivitiesAjax(queryParams, activitiesUrl)'
    ]
  }

  _computeUrl(responsePlanID: string) {
    if (!responsePlanID) {
      return;
    }

    return Endpoints.responseParametersClusterActivities(responsePlanID);
  }

  private _clusterActivitiesAjaxDebouncer!: Debouncer;

  _openModal() {
    (this.shadowRoot!.querySelector('#modal') as CreationModalActivitiesEl).open();
  }

  _clusterActivitiesAjax() {
    if (!this.activitiesUrl) {
      return;
    }

    this._clusterActivitiesAjaxDebouncer = Debouncer.debounce(this._clusterActivitiesAjaxDebouncer,
      timeOut.after(300),
      () => {
        const thunk = (this.$.activities as EtoolsPrpAjaxEl).thunk();
        (this.$.activities as EtoolsPrpAjaxEl).abort();

        this.reduxStore.dispatch(fetchClusterActivitiesList(thunk))
          // @ts-ignore
          .catch(function(err) {
            // TODO: error handling.
          });
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._clusterActivitiesAjaxDebouncer && this._clusterActivitiesAjaxDebouncer.isActive()) {
      this._clusterActivitiesAjaxDebouncer.cancel();
    }
  }
}

window.customElements.define('clusters-activities', Activities);

export {Activities as ClustersActivitiesEl};
