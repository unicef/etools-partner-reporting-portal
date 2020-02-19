import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable - dropdown - filter';
import '../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import Endpoints from "../../../endpoints";
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class LocationFilter extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="locations"
        url="[[locationsUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('location')]]"
        name="location"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  `;
  }


  @property({type: String, computed: '_computeLocationsUrl(locationId)', observer: '_fetchLocations'})
  locationsUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(state.location.id)'})
  locationId!: string;

  @property({type: String})
  value = '';

  @property({type: Array})
  data = [];

  _computeLocationsUrl(locationId: string) {
    return locationId ? Endpoints.locations(locationId) : '';
  };

  _fetchLocations(url: string) {
    var self = this;

    if (!url) {
      return;
    }

    (this.$.locations as EtoolsPrpAjaxEl).abort();
    (this.$.locations as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        self.set('data', [{
          id: '',
          title: 'All',
        }].concat(res.data));
      })
      .catch(function(err) { // jshint ignore:line
        // TODO: error handling
      });
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.locations as EtoolsPrpAjaxEl).abort();
  };
}

window.customElements.define('location-filter', LocationFilter);
