import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter-multi';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import FilterDependenciesMixin from '../../../etools-prp-common/mixins/filter-dependencies-mixin';
import Endpoints from '../../../endpoints';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

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

      <etools-prp-ajax id="locations" url="[[locationsUrl]]"> </etools-prp-ajax>

      <dropdown-filter-multi label="[[localize('location')]]" name="location" value="[[value]]" data="[[data]]">
      </dropdown-filter-multi>
    `;
  }

  @property({type: String, computed: '_computeLocationsUrl(locationId)', observer: '_fetchLocations'})
  locationsUrl = '';

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: Array})
  data!: any;

  @property({type: Boolean})
  pending = false;

  @property({type: String})
  value!: string;

  static get observers() {
    return ['_fetchLocations(locationsUrl, params)'];
  }

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
        this.set('data', res.data);
      })
      // @ts-ignore
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.$.locations as EtoolsPrpAjaxEl).abort();
  }
}

window.customElements.define('location-filter-multi', LocationFilterMulti);
