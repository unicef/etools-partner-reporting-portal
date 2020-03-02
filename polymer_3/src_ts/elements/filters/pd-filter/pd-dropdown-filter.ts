import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/dropdown-filter-multi';
import '../../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';

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

    <etools-prp-ajax
        id="programmeDocuments"
        url="[[programmeDocumentsUrl]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
      class="item"
      label="[[localize('pd')]]"
      name="pds"
      value="[[value]]"
      data="[[data]]">
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
    var self = this;

    if (!url) {
      return;
    }

    (this.$.programmeDocuments as EtoolsPrpAjaxEl).abort();
    (this.$.programmeDocuments as EtoolsPrpAjaxEl).thunk()()
      .then(function(res: any) {
        self.set('data', res.data.results);
      })
      .catch(function(err) {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.connectedCallback();
    (this.$.programmeDocuments as EtoolsPrpAjaxEl).abort();;
  }

}

window.customElements.define('pd-dropdown-filter', PDDropdownFilter);
