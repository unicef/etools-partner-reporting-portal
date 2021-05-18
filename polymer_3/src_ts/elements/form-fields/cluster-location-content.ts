import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import './dropdown-form-input';
import '../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../etools-prp-common/endpoints';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';

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

      <etools-prp-ajax id="locationNames" url="[[locationNamesUrl]]"> </etools-prp-ajax>
    `;
  }

  @property({type: Array, notify: true})
  locations = [];

  @property({type: String, computed: '_computeLocationNamesUrl(responsePlanID)', observer: '_fetchLocationNames'})
  locationNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  _computeLocationNamesUrl(responsePlanID: string) {
    if (!responsePlanID) {
      return;
    }
    return Endpoints.clusterLocationNames(responsePlanID);
  }

  _fetchLocationNames() {
    if (!this.locationNamesUrl) {
      return;
    }

    (this.$.locationNames as EtoolsPrpAjaxEl).abort();
    (this.$.locationNames as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: GenericObject) => {
        this.set('locations', res.data);
      })
      .catch((_err: GenericObject) => {
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
