import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter-multi';
import '../../etools-prp-ajax';
import '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
import Endpoints from '../../../endpoints';
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

      <etools-prp-ajax id="clusters" url="[[clustersUrl]]"> </etools-prp-ajax>

      <dropdown-filter-multi label="[[localize('clusters')]]" name="clusters" value="[[value]]" data="[[data]]">
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
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterNames(responsePlanId);
  }

  _fetchClusters() {
    if (!this.clustersUrl) {
      return;
    }
    const self = this;
    const thunk = (this.$.clusters as EtoolsPrpAjaxEl).thunk();
    (this.$.clusters as EtoolsPrpAjaxEl).abort();

    thunk()
      .then((res: any) => {
        self.set('data', res.data);
      })
      .catch((_err: any) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.clusters as EtoolsPrpAjaxEl).abort();
  }
}

window.customElements.define('cluster-filter-multi', ClusterFilterMulti);
