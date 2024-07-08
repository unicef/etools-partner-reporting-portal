import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import {connect} from 'pwa-helpers';
import {store} from '../../../redux/store';

@customElement('location-filter')
export class LocationFilter extends LocalizeMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  locationsUrl = '';

  @property({type: String})
  locationId = '';

  @property({type: String})
  value = '-1';

  @property({type: Array})
  data: any[] = [];

  render() {
    return html`
      <etools-prp-ajax id="locations" .url="${this.locationsUrl}"></etools-prp-ajax>
      <searchable-dropdown-filter
        .label="${this.localize('location')}"
        option-label="name"
        name="location"
        .value="${this.value}"
        .data="${this.data}"
      >
      </searchable-dropdown-filter>
    `;
  }

  stateChanged(state) {
    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('locationId')) {
      this.locationsUrl = this._computeLocationsUrl(this.locationId);
    }
    if (changedProperties.has('locationsUrl')) {
      this._fetchLocations(this.locationsUrl);
    }
  }

  _computeLocationsUrl(locationId) {
    return locationId ? Endpoints.locations(locationId) : '';
  }

  _fetchLocations(url) {
    if (!url) {
      return;
    }

    const locationsAjax = this.shadowRoot?.getElementById('locations') as any as EtoolsPrpAjaxEl;
    locationsAjax.abort();
    locationsAjax
      .thunk()()
      .then((res) => {
        this.data = [
          {
            id: '-1',
            name: 'All'
          },
          ...(res.data || [])
        ];
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const locationsAjax = this.shadowRoot?.getElementById('locations') as any as EtoolsPrpAjaxEl;
    locationsAjax.abort();
  }
}

export {LocationFilter as LocationFilterEl};
