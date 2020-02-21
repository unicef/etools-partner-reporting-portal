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

  @property({type: String, computed: '_computeClusterNamesUrl(responsePlanID)', observer: '_fetchClusterNames'})
  clusterNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.responsePlans.current)'})
  responsePlanCurrent!: GenericObject;

  @property({type: Array, notify: true})
  clusters = [];

  public static get observers() {
    return [
      '_fetchClusterNames(clusterNamesUrl, params)',
    ]
  }

  _computeClusterNamesUrl(responsePlanID: string) {
    return Endpoints.clusterNames(responsePlanID);
  }

  _computeParams(partner: string) {
    if (partner) {
      return {partner: partner};
    }
    return {};
  }

  _fetchClusterNames() {
    const self = this;

    (this.$.clusterNames as EtoolsPrpAjaxEl).abort();

    (this.$.clusterNames as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        self.set('clusters', res.data);
      })
      .catch(function(err: any) { // jshint ignore:line
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
