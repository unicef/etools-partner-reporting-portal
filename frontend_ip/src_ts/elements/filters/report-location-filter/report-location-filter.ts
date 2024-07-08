import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../redux/store';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';

@customElement('report-location-filter')
export class ReportLocationFilter extends LocalizeMixin(connect(store)(LitElement)) {
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
  reportId = '';

  @property({type: String})
  value = '';

  @property({type: Array})
  options: any[] = [];

  render() {
    return html`
      <etools-prp-ajax id="locations" .url="${this.locationsUrl}"> </etools-prp-ajax>
      <searchable-dropdown-filter
        .label="${this.localize('location')}"
        name="location"
        option-label="name"
        .value="${this.value}"
        .data="${this.options}"
      >
      </searchable-dropdown-filter>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('locationId') || changedProperties.has('reportId')) {
      this.locationsUrl = this._computeLocationsUrl(this.locationId, this.reportId);
    }
    if (changedProperties.has('locationsUrl')) {
      this._fetchLocations();
    }
  }

  stateChanged(state) {
    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }

    if (this.reportId !== state.programmeDocumentReports.current.id) {
      this.reportId = state.location.id;
    }
  }

  _computeLocationsUrl(locationId, reportId) {
    return Endpoints.indicatorDataLocation(locationId, reportId);
  }

  _fetchLocations() {
    const thunk = (this.shadowRoot?.getElementById('locations') as any as EtoolsPrpAjaxEl).thunk();
    (this.shadowRoot?.getElementById('locations') as any as EtoolsPrpAjaxEl).abort();
    thunk()
      .then((res: any) => {
        this.options = [{id: '-1', name: 'All'}].concat(res.data || []);
      })
      .catch((_err: any) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    (this.shadowRoot?.getElementById('locations') as any as EtoolsPrpAjaxEl).abort();
  }
}

export {ReportLocationFilter as ReportLocationFilterEl};
