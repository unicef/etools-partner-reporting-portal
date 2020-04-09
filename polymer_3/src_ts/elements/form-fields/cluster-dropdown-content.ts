import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import './dropdown-form-input';
import '../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import Endpoints from '../../endpoints';
import {GenericObject} from '../../typings/globals.types';

/**
 * @polymer
 * @customElement
 */
class ClusterDropdownContent extends ReduxConnectedElement {

  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
      id="clusterNames"
      url="[[clusterNamesUrl]]"
      params="[[params]]">
    </etools-prp-ajax>
  `;
  }

  @property({type: String})
  partner!: string;

  @property({type: Object, computed: '_computeParams(partner)'})
  params!: GenericObject;

  @property({type: String, computed: '_computeClusterNamesUrl(responsePlanId)', observer: '_fetchClusterNames'})
  clusterNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)'})
  responsePlanCurrent!: GenericObject;

  @property({type: Array, notify: true})
  clusters = [];

  public static get observers() {
    return [
      '_fetchClusterNames(clusterNamesUrl, params)'
    ];
  }

  _computeClusterNamesUrl(responsePlanId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.clusterNames(responsePlanId);
  }

  _computeParams(partner: string) {
    if (partner) {
      return {partner: partner};
    }
    return {};
  }

  _fetchClusterNames() {
    if (!this.clusterNamesUrl) {
      return;
    }

    const self = this;
    (this.$.clusterNames as EtoolsPrpAjaxEl).abort();

    (this.$.clusterNames as EtoolsPrpAjaxEl).thunk()()
      .then((res: GenericObject) => {
        self.set('clusters', res.data);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    (this.$.clusterNames as EtoolsPrpAjaxEl).abort();
  }

}

window.customElements.define('cluster-dropdown-content', ClusterDropdownContent);

export {ClusterDropdownContent as ClusterDropdownContentEl};
