import {html} from '@polymer/polymer';
import "@polymer/iron-location/iron-location";
import "@polymer/iron-location/iron-query-params";
import "../dropdown-filter/searchable-dropdown-filter.html";
import "../../etools-prp-ajax.html";
import UtilsMixin from '../../../mixins/utils-mixin';
import FilterMixin from '../../../mixins/filter-mixin';
import {ReduxConnectedElement} from "../../../ReduxConnectedElement";
import Endpoints from "../../../endpoints";
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin FilterMixin
 */
class ClusterFilter extends UtilsMixin(FilterMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="clusterNames"
        url="[[clusterNamesUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <dropdown-filter
        label="[[localize('cluster')]]"
        name="cluster_id"
        value="[[value]]"
        data="[[data]]">
    </dropdown-filter>
  `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: '_computeClusterNamesUrl(responsePlanID)'})
  clusterNamesUrl = '';

  @property({type: String, computed: 'getReduxStatevalue(state.responsePlans.currentID)'})
  responsePlanID = [];

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;


  static get observers() {
    return ['_fetchClusterNames(clusterNamesUrl, params)'];
  };

  _computeClusterNamesUrl(responsePlanID: string) {
    return Endpoints.clusterNames(responsePlanID);
  };

  _fetchClusterNames() {
    this.debounce('fetch-cluster-names', function() {
      var self = this;

      this.$.clusterNames.abort();

      this.$.clusterNames.thunk()()
        .then(function(res) {
          self.set('data', [{
            id: '',
            title: 'All',
          }].concat(res.data));
        })
        .catch(function(err) { // jshint ignore:line
          // TODO: error handling
        });
    }, 100);
  };

  detached() {
    this.$.clusterNames.abort();

    if (this.isDebouncerActive('fetch-cluster-names')) {
      this.cancelDebouncer('fetch-cluster-names');
    }
  };

}

window.customElements.define('cluster-filter', ClusterFilter);




// <link rel="import" href = "../../../../bower_components/polymer/polymer.html" >
// <link rel="import" href="../../../../bower_components/iron-location/iron-location.html">
// <link rel="import" href="../../../../bower_components/iron-location/iron-query-params.html">

// <link rel="import" href="../dropdown-filter/dropdown-filter.html">
// <link rel="import" href="../../etools-prp-ajax.html">
// <link rel="import" href="../../../endpoints.html">
// <link rel="import" href="../../../redux/store.html">
// <link rel="import" href="../../../behaviors/localize.html">
// <link rel="import" href="../../../behaviors/filter-dependencies.html">
