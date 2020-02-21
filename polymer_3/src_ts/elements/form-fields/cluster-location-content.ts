import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import './dropdown-form-input';
import '../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import Endpoints from '../../endpoints';

/**
 * @polymer
 * @customElement
 */
class ClusterLocationContent extends ReduxConnectedElement {

  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="locationNames"
        url="[[locationNamesUrl]]">
    </etools-prp-ajax>
  `;
  }

  @property({type: Array, notify: true})
  locations = [];

  @property({type: String, computed: '_computeLocationNamesUrl(responsePlanID)', observer: '_fetchLocationNames'})
  locationNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  _computeLocationNamesUrl(responsePlanID: string) {
    return Endpoints.clusterLocationNames(responsePlanID);
  }

  _fetchLocationNames() {
    const self = this;

    (this.$.locationNames as EtoolsPrpAjaxEl).abort();

    (this.$.locationNames as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        self.set('locations', res.data);
      })
      .catch(function(err: any) { // jshint ignore:line
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    (this.$.locationNames as EtoolsPrpAjaxEl).abort();
  }

}

window.customElements.define('cluster-location-content', ClusterLocationContent);

export {ClusterLocationContent as ClusterLocationContentEl};
