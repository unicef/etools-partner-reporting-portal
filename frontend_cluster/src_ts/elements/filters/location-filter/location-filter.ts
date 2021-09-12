import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

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

      <etools-prp-ajax id="locations" url="[[locationsUrl]]"> </etools-prp-ajax>

      <searchable-dropdown-filter label="[[localize('location')]]" name="location" value="[[value]]" data="[[data]]">
      </searchable-dropdown-filter>
    `;
  }

  @property({type: String, computed: '_computeLocationsUrl(locationId)', observer: '_fetchLocations'})
  locationsUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String})
  value = '';

  @property({type: Array})
  data = [];

  _computeLocationsUrl(locationId: string) {
    return locationId ? Endpoints.locations(locationId) : '';
  }

  _fetchLocations(url: string) {
    if (!url) {
      return;
    }

    (this.$.locations as EtoolsPrpAjaxEl).abort();
    (this.$.locations as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        this.set(
          'data',
          [
            {
              id: '',
              title: 'All'
            }
          ].concat(res.data || [])
        );
      })
      .catch((err: GenericObject) => {
        console.log(err);
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.locations as EtoolsPrpAjaxEl).abort();
  }
}

window.customElements.define('location-filter', LocationFilter);
