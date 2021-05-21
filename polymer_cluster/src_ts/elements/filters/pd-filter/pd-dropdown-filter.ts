import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter-multi';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax';
import Endpoints from '../../../etools-prp-common/endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class PDDropdownFilter extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-ajax id="programmeDocuments" url="[[programmeDocumentsUrl]]"> </etools-prp-ajax>

      <dropdown-filter-multi class="item" label="[[localize('pd')]]" name="pds" value="[[value]]" data="[[data]]">
      </dropdown-filter-multi>
    `;
  }

  @property({type: String, computed: '_computeProgrammeDocumentsUrl(locationId)', observer: '_fetchPDs'})
  programmeDocumentsUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String})
  computedValue!: string;

  @property({type: String})
  value!: string;

  @property({type: Array})
  data = [];

  _computeProgrammeDocumentsUrl(locationId: string) {
    return locationId ? Endpoints.programmeDocuments(locationId) : '';
  }

  _fetchPDs(url: string) {
    if (!url) {
      return;
    }

    (this.$.programmeDocuments as EtoolsPrpAjaxEl).abort();
    (this.$.programmeDocuments as EtoolsPrpAjaxEl)
      .thunk()()
      .then((res: any) => {
        this.set('data', res.data.results);
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.connectedCallback();
    (this.$.programmeDocuments as EtoolsPrpAjaxEl).abort();
  }
}

window.customElements.define('pd-dropdown-filter', PDDropdownFilter);
