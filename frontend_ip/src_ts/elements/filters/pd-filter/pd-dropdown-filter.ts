import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../../redux/store';
import '../dropdown-filter/dropdown-filter-multi';
import Endpoints from '../../../endpoints';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';

@customElement('pd-dropdown-filter')
export class PDDropdownFilter extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  programmeDocumentsUrl = '';

  @property({type: String})
  locationId = '';

  @property({type: String})
  computedValue = '';

  @property({type: String})
  value = '';

  @property({type: Array})
  data: any[] = [];

  render() {
    return html`
      <dropdown-filter-multi
        class="item"
        .label="${translate('PD_TITLE')}"
        name="pds"
        .value="${this.value}"
        .data="${this.data}"
      >
      </dropdown-filter-multi>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._fetchPDs = debounce(this._fetchPDs.bind(this), 100) as any;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId')) {
      this.programmeDocumentsUrl = this._computeProgrammeDocumentsUrl(this.locationId);
    }
    if (changedProperties.has('programmeDocumentsUrl')) {
      this._fetchPDs();
    }
  }

  stateChanged(state) {
    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
  }

  _computeProgrammeDocumentsUrl(locationId) {
    return locationId ? Endpoints.programmeDocuments(locationId) : '';
  }

  _fetchPDs() {
    if (!this.programmeDocumentsUrl) {
      return;
    }

    sendRequest({
      method: 'GET',
      endpoint: {url: this.programmeDocumentsUrl}
    })
      .then((res) => {
        this.data = res.results;
      })
      .catch((_err: any) => {
        // TODO: error handling
        console.log(_err);
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {PDDropdownFilter as PDDropdownFilterEl};
