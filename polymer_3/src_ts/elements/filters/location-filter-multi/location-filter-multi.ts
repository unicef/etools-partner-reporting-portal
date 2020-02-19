import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import "../dropdown-filter/searchable-dropdown-filter.html";
import "../../etools-prp-ajax.html";
import '../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from "../../../ReduxConnectedElement";
import Endpoints from "../../../endpoints";
import FilterDependenciesMixin from '../../../mixins/filter-dependencies-mixin';



/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin FilterDependenciesMixin
 */
class LocationFilterMulti extends LocalizeMixin(FilterDependenciesMixin(ReduxConnectedElement)) {
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

    <dropdown-filter-multi
        label="[[localize('location')]]"
        name="location"
        value="[[value]]"
        data="[[data]]">
    </dropdown-filter-multi>
  `;
  }

  @property({type: String, computed: '_computeLocationsUrl(locationId)', observer: '_fetchLocations'})
  locationsUrl = '';

  @property({type: String, computed: 'getReduxStateArray(rootState.location.id)'})
  locationId = [];

  @property({type: Array})
  data!: any;

  @property({type: Boolean})
  pending = false;

  @property({type: String})
  value!: string;

  //@Lajos not sure about this
  static get observers() {
    return ['_fetchLocations(locationsUrl, params)'];
  }

  _computeActivitiesUrl(locationId: string) {
    return locationId ? Endpoints.locations(locationId) : '';
  };

  _fetchLocations(url: string) {
    var self = this;

    if (!url) {
      return;
    }

    (this.$.locations as EtoolsPrpAjaxEl).abort();

    (this.$.locations as EtoolsPrpAjaxEl).thunk()
      .then(function(res: any) {
        self.set('data', res.data);
      })
      .catch(function(err: any) { // jshint ignore:line
        // TODO: error handling
      });
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.locations as EtoolsPrpAjaxEl).abort();
  };
}

window.customElements.define('location-filter-multi', LocationFilterMulti);
