import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import "../dropdown-filter/dropdown-filter-multi";
import "../../etools-prp-ajax";
import "../../../endpoints";
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from "../../../ReduxConnectedElement";
import Endpoints from "../../../endpoints"
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ClusterFilterMulti extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="clusters"
        url="[[clustersUrl]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="[[localize('clusters')]]"
        name="clusters"
        value="[[value]]"
        data="[[data]]">
    </dropdown-filter-multi>
  `;
  }

  @property({type: String, computed: '_computeClustersUrl(responsePlanId)', observer: '_fetchClusters'})
  clustersUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;

  _computeClustersUrl(responsePlanId: string) {
    return Endpoints.clusterNames(responsePlanId);
  };

  _fetchClusters() {
    var self = this;
    const thunk = (this.$.clusters as EtoolsPrpAjaxEl).thunk();
    (this.$.clusters as EtoolsPrpAjaxEl).abort();

    thunk()
      .then(function(res: any) {
        self.set('data', res.data);
      })
      .catch(function(err: any) { // jshint ignore:line
        // TODO: error handling
      });
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.clusters as EtoolsPrpAjaxEl).abort();
  };
}

window.customElements.define('cluster-filter-multi', ClusterFilterMulti);
