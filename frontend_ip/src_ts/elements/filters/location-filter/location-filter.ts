import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import {connect} from 'pwa-helpers';
import {store} from '../../../redux/store';
import {debounce} from 'lodash-es';

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
