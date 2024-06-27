import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../redux/store';
import '../dropdown-filter/dropdown-filter-multi';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import FilterDependenciesMixin from '../../../etools-prp-common/mixins/filter-dependencies-mixin';
import Endpoints from '../../../endpoints';

@customElement('location-filter-multi')
export class LocationFilterMulti extends LocalizeMixin(FilterDependenciesMixin(connect(store)(LitElement))) {
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

  render() {
    return html`
      <etools-prp-ajax id="locations" .url="${this.locationsUrl}"></etools-prp-ajax>
      <dropdown-filter-multi
        .label="${this.localize('location')}"
        option-label="name"
        name="location"
        .value="${this.value}"
        .data="${this.data}"
      >
      </dropdown-filter-multi>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('locationId')) {
      this.locationsUrl = this._computeLocationsUrl(this.locationId);
    }
    if (changedProperties.has('locationsUrl')) {
      this._fetchLocations(this.locationsUrl);
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

  _fetchLocations(url) {
    if (!url) {
      return;
    }

    const locationsAjax = this.shadowRoot?.getElementById('locations') as any as EtoolsPrpAjaxEl;
    locationsAjax.abort();
    locationsAjax
      .thunk()()
      .then((res) => {
        this.data = res.data;
      })
      .catch((_err: any) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const locationsAjax = this.shadowRoot?.getElementById('locations') as any as EtoolsPrpAjaxEl;
    locationsAjax.abort();
  }
}

export {LocationFilterMulti as LocationFilterMultiEl};
