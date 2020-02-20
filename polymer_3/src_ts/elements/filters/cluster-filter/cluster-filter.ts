import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../dropdown-filter/searchable-dropdown-filter.html';
import '../../etools-prp-ajax.html";
import UtilsMixin from '../../../mixins/utils-mixin';
import FilterMixin from '../../../mixins/filter-mixin';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import Endpoints from '../../../endpoints';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../typings/globals.types';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { EtoolsPrpAjaxEl } from '../../etools-prp-ajax';

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

  @property({type: String, computed: 'getReduxStatevalue(rootState.responsePlans.currentID)'})
  responsePlanID = [];

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;


  static get observers() {
    return ['_fetchClusterNames(clusterNamesUrl, params)'];
  };

  private _debouncer!: Debouncer;

  _computeClusterNamesUrl(responsePlanID: string) {
    return Endpoints.clusterNames(responsePlanID);
  };

  _fetchClusterNames() {
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(250),
      () => {
      var self = this;
      const thunk = (this.$.clusters as EtoolsPrpAjaxEl).thunk();
      (this.$.clusters as EtoolsPrpAjaxEl).abort();

      thunk()
        .then(function(res: any) {
          self.set('data', [{
            id: '',
            title: 'All',
          }].concat(res.data));
        })
        .catch(function(err) { // jshint ignore:line
          // TODO: error handling
        });
    });
  };

  disconnectedCallback() {
    super.connectedCallback();
    (this.$.clusters as EtoolsPrpAjaxEl).abort();

    if (this._debouncer.isActive()) {
      this._debouncer.cancel();
    }
  };

}

window.customElements.define('cluster-filter', ClusterFilter);
