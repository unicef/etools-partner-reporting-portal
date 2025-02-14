import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../../redux/store';
import '../dropdown-filter/dropdown-filter-multi';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import FilterDependenciesMixin from '../../../etools-prp-common/mixins/filter-dependencies-mixin';
import Endpoints from '../../../endpoints';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';

@customElement('location-filter-multi')
export class LocationFilterMulti extends FilterDependenciesMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  locationsUrl = '';

  @property({type: String})
  locationId = '';

  @property({type: Array})
  data: any[] = [];

  @property({type: Boolean})
  pending = false;

  @property({type: String})
  value = '';

  connectedCallback(): void {
    super.connectedCallback();
    this._fetchLocations = debounce(this._fetchLocations.bind(this), 100) as any;
  }

  render() {
    return html`
      <dropdown-filter-multi
        .label="${translate('LOCATION')}"
        option-label="name"
        name="location"
        .value="${this.value}"
        .data="${this.data}"
      >
      </dropdown-filter-multi>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId')) {
      this.locationsUrl = this._computeLocationsUrl(this.locationId);
    }

    if (changedProperties.has('locationsUrl')) {
      this._fetchLocations();
    }
  }

  stateChanged(state) {
    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
  }

  _computeLocationsUrl(locationId) {
    return locationId ? Endpoints.locations(locationId) : '';
  }

  _fetchLocations() {
    if (!this.locationsUrl) {
      return;
    }

    sendRequest({
      method: 'GET',
      endpoint: {url: this.locationsUrl}
    })
      .then((res) => {
        this.data = res;
      })
      .catch((_err: any) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {LocationFilterMulti as LocationFilterMultiEl};
