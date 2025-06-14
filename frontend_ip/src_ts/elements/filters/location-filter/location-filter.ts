import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '../dropdown-filter/searchable-dropdown-filter';
import Endpoints from '../../../endpoints';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../../redux/store';
import {debounce} from 'lodash-es';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';

@customElement('location-filter')
export class LocationFilter extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  locationsUrl = '';

  @property({type: String, reflect: true})
  locationId = '';

  @property({type: String})
  value = '-1';

  @property({type: Array})
  data: any[] = [];

  render() {
    return html`
      <searchable-dropdown-filter
        .label="${translate('LOCATION')}"
        option-label="name"
        name="location"
        .value="${this.value}"
        .data="${this.data}"
      >
      </searchable-dropdown-filter>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._fetchLocations = debounce(this._fetchLocations.bind(this), 100) as any;
  }

  stateChanged(state) {
    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId')) {
      this.locationsUrl = this._computeLocationsUrl();
    }
    if (changedProperties.has('locationsUrl')) {
      this._fetchLocations();
    }
  }

  _computeLocationsUrl() {
    return this.locationId ? Endpoints.locations(this.locationId) : '';
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
        this.data = [
          {
            id: '-1',
            name: 'All'
          },
          ...(res || [])
        ];
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {LocationFilter as LocationFilterEl};
