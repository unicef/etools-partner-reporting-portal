import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../../redux/store';
import '../dropdown-filter/searchable-dropdown-filter';
import Endpoints from '../../../endpoints';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';

@customElement('report-location-filter')
export class ReportLocationFilter extends connect(store)(LitElement) {
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
      <searchable-dropdown-filter
        .label="${translate('LOCATION')}"
        name="location"
        option-label="name"
        .value="${this.value}"
        .data="${this.options}"
      >
      </searchable-dropdown-filter>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._fetchLocations = debounce(this._fetchLocations.bind(this), 100) as any;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId') || changedProperties.has('reportId')) {
      this.locationsUrl = this._computeLocationsUrl();
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
      this.reportId = state.programmeDocumentReports.current.id;
    }
  }

  _computeLocationsUrl() {
    return this.locationId && this.reportId ? Endpoints.indicatorDataLocation(this.locationId, this.reportId) : '';
  }

  _fetchLocations() {
    if (!this.locationsUrl) {
      return;
    }

    sendRequest({
      method: 'GET',
      endpoint: {url: this.locationsUrl}
    })
      .then((res: any) => {
        this.options = [{id: '-1', name: 'All'}].concat(res || []);
      })
      .catch((_err: any) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {ReportLocationFilter as ReportLocationFilterEl};
