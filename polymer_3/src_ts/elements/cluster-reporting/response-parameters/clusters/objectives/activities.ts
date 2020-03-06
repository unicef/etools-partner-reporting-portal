import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import '../../../../page-body';
import '../../../response-parameters/clusters/activities/activities-list';
import '../../../response-parameters/clusters/activities/filters';
import {GenericObject} from '../../../../../typings/globals.types';
import {tableStyles} from '../../../../../styles/table-styles';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {EtoolsPrpAjaxEl} from '../../../../etools-prp-ajax';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {fetchClusterActivitiesList} from '../../../../../redux/actions/clusterActivities';
import Endpoints from '../../../../../endpoints';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class Activitites extends UtilsMixin(ReduxConnectedElement) {
  public static get template() {
    // language=HTML
    return html`
    ${tableStyles}
    <style include="data-table-styles table-styles">
      :host {
        display: block;
      }
    </style>

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
      <cluster-activities-filters class="filters"></cluster-activities-filters>

      <clusters-activities-list is-minimal-list></clusters-activities-list>
    </page-body>
    `;
  }

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: String, observer: '_updateParams'})
  objectiveId!: boolean;

  @property({type: Object, observer: '_clusterActivitiesAjax'})
  queryParams!: GenericObject;

  @property({type: String, computed: '_computeActivitiesUrl(queryParams, objectiveId, responsePlanID)'})
  activitiesUrl!: string;

  private _clusterActivityDebouncer!: Debouncer;


  _updateParams(objectiveId: string) {
    setTimeout(() => {
      this.set('queryParams.cluster_objective_id', objectiveId);
    });
  }

  _clusterActivitiesAjax(queryParams: GenericObject) {
    this._clusterActivityDebouncer = Debouncer.debounce(this._clusterActivityDebouncer,
      timeOut.after(100),
      () => {
        const thunk = (this.$.activities as EtoolsPrpAjaxEl).thunk();
        if (typeof queryParams.cluster_objective_id === 'undefined') {
          return;
        }

        (this.$.activities as EtoolsPrpAjaxEl).abort();
        //App.Actions.ClusterActivities.fetchClusterActivitiesList
        this.reduxStore.dispatch(fetchClusterActivitiesList(thunk))
          .catch(function(err) { // jshint ignore:line
            // TODO: error handling.
          });
      });
  }

  _computeActivitiesUrl() {
    return Endpoints.responseParametersClusterActivities(this.responsePlanID);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._clusterActivityDebouncer && this._clusterActivityDebouncer.isActive()) {
      this._clusterActivityDebouncer.cancel();
    }
  }
}

window.customElements.define('rp-clusters-details-activities', Activitites);

export {Activitites as RpClustersDetailsActivititesEl};
