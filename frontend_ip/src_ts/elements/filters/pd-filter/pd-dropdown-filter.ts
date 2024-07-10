import {html, css, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../../redux/store';
import '../dropdown-filter/dropdown-filter-multi';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';

@customElement('pd-dropdown-filter')
export class PDDropdownFilter extends LocalizeMixin(connect(store)(LitElement)) {
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
      <etools-prp-ajax id="programmeDocuments" .url="${this.programmeDocumentsUrl}"></etools-prp-ajax>
      <dropdown-filter-multi
        class="item"
        .label="${this.localize('pd_title')}"
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

    const programmeDocumentsAjax = this.shadowRoot?.getElementById('programmeDocuments') as any as EtoolsPrpAjaxEl;
    programmeDocumentsAjax.abort();
    programmeDocumentsAjax
      .thunk()()
      .then((res) => {
        this.data = res.data?.results;
      })
      .catch((_err: any) => {
        // TODO: error handling
        console.log(_err);
      });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const programmeDocumentsAjax = this.shadowRoot?.getElementById('programmeDocuments') as any as EtoolsPrpAjaxEl;
    programmeDocumentsAjax.abort();
  }
}

export {PDDropdownFilter as PDDropdownFilterEl};
