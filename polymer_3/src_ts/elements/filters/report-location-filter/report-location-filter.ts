import {html} from '@polymer/polymer';
import '../dropdown-filter/searchable - dropdown - filter';
import '../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import Endpoints from "../../../endpoints";
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';

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

  @property({type: String, computed: 'getReduxStateValue(state.location.id)'})
  locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(state.programmeDocumentReports.current.id)'})
  reportId!: string;

  @property({type: String})
  value!: string;

  @property({type: Array})
  options = [];

  _computeLocationsUrl(locationId: string, reportId: string) {
    return Endpoints.indicatorDataLocation(locationId, reportId);
  };

  _fetchLocations() {
    var self = this;

    (this.$.locations as EtoolsPrpAjaxEl).abort();
    (this.$.locations as EtoolsPrpAjaxEl).thunk()
      .then(function(res: any) {
        self.set('options', [{
          id: '',
          title: 'All',
        }].concat(res.data));
      })
      .catch(function(err: any) { // jshint ignore:line
        // TODO: error handling
      });
  };

  detached() {
    (this.$.locations as EtoolsPrpAjaxEl).abort();
  };
}

window.customElements.define('report-location-filter', ReportLocationFilter);
