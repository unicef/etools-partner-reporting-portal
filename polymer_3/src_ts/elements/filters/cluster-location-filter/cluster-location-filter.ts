import {html} from '@polymer/polymer';
import '../dropdown-filter/dropdown-filter-multi';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from "../../../ReduxConnectedElement";
import Endpoints from '../../../endpoints';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ClusterLocationFilter extends LocalizeMixin(ReduxConnectedElement) {
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

    <searchable-dropdown-filter
        label="[[localize('location')]]"
        name="location"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  </template>
  `;
  }

  @property({type: String, computed: '_computeLocationNamesUrl(responsePlanID)', observer: '_fetchLocationNames'})
  locationNamesUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(state.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: Array})
  data = [];

  @property({type: String})
  value!: string;

  _computeLocationNamesUrl(responsePlanID: string) {
    return Endpoints.clusterLocationNames(responsePlanID);
  };

  _fetchLocationNames() {
    var self = this;
    const thunk = (this.$.locationNames as EtoolsPrpAjaxEl).thunk();
    (this.$.locationNames as EtoolsPrpAjaxEl).abort();

    thunk()
      .then(function(res: any) {
        self.set('data', [{
          id: '',
          title: 'All',
        }].concat(res.data));
      })
      .catch(function(err: any) { // jshint ignore:line
        // TODO: error handling
      });
  };

  detached() {
    (this.$.locationNames as EtoolsPrpAjaxEl).abort();
  };
}

window.customElements.define('cluster-location-filter', ClusterLocationFilter);
