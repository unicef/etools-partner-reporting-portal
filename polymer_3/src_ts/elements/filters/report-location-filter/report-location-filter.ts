import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable-dropdown-filter';
import '../../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {GenericObject} from '../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 */
class ReportLocationFilter extends LocalizeMixin(ReduxConnectedElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="locations"
        url="[[locationsUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('location')]]"
        name="location"
        value="[[value]]"
        data="[[options]]">
    </searchable-dropdown-filter>
  `;
  }


  @property({type: String, computed: '_computeLocationsUrl(locationId, reportId)', observer: '_fetchLocations'})
  locationsUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  reportId!: string;

  @property({type: String})
  value!: string;

  @property({type: Array})
  options = [];

  _computeLocationsUrl(locationId: string, reportId: string) {
    return Endpoints.indicatorDataLocation(locationId, reportId);
  }

  _fetchLocations() {
    const self = this;
    const thunk = (this.$.locations as EtoolsPrpAjaxEl).thunk();
    (this.$.locations as EtoolsPrpAjaxEl).abort();
    thunk()
      .then((res: GenericObject) => {
        self.set('options', [{
          id: '',
          title: 'All'
        }].concat(res.data || []));
      })
      .catch((_err: GenericObject) => {
        // TODO: error handling
      });
  }

  disconnectedCallback() {
    super.connectedCallback();
    (this.$.locations as EtoolsPrpAjaxEl).abort();
  }

}

window.customElements.define('report-location-filter', ReportLocationFilter);
