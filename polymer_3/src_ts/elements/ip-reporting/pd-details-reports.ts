import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {property} from '@polymer/decorators';
import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../ip-reporting/pd-report-filters';
import '../ip-reporting/pd-reports-toolbar';
import '../ip-reporting/pd-reports-list';
import {tableStyles} from '../../styles/table-styles';
import {GenericObject} from '../../typings/globals.types';
import Endpoints from '../../endpoints';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import {pdReportsFetch} from '../../redux/actions/pdReports';
import {computePDReportsUrl, computePDReportsParams} from './js/pd-details-reports-functions';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 */
class PdDetailsReport extends ReduxConnectedElement {

  static get template() {
    return html`
    ${tableStyles}
    <style include="data-table-styles table-styles">
      :host {
        display: block;
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="programmeDocuments"
        url="[[programmeDocumentsUrl]]">
    </etools-prp-ajax>

    <etools-prp-ajax
        id="pdReports"
        url="[[pdReportsUrl]]"
        params="[[pdReportsParams]]">
    </etools-prp-ajax>

    <page-body>
      <pd-report-filters></pd-report-filters>
      <pd-reports-toolbar></pd-reports-toolbar>
      <pd-reports-list></pd-reports-list>
    </page-body>

  `;
  }

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  pdId!: string;

  @property({type: String, computed: '_computePDReportsUrl(locationId)'})
  pdReportsUrl!: string;

  @property({type: Object, computed: '_computePDReportsParams(pdId, queryParams)'})
  pdReportsParams!: GenericObject;

  @property({type: String, computed: '_computeProgrammeDocumentsUrl(locationId)'})
  programmeDocumentsUrl!: string;

  @property({type: Object, computed: 'getReduxStateValue(rootState.programmeDocumentReports.countByPD)', observer: '_getPdReports'})
  pdReportsCount!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  pdReportsId!: string;

  private _debouncer!: Debouncer;

  public static get observers() {
    return [
      '_handleInputChange(pdReportsUrl, pdReportsParams)',
    ]
  }

  _computePDReportsUrl(locationId: string) {
    return computePDReportsUrl(locationId);
  }

  _computePDReportsParams(pdId: string, queryParams: GenericObject) {
    return computePDReportsParams(pdId, queryParams);
  }

  _computeProgrammeDocumentsUrl(locationId: string) {
    return locationId ? Endpoints.programmeDocuments(locationId) : '';
  }

  _handleInputChange(url: string) {
    const self = this;
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(250),
      () => {
        if (!url) {
          return;
        }

        const pdReportsThunk = (this.$.pdReports as EtoolsPrpAjaxEl).thunk();

        // Cancel the pending request, if any
        (this.$.pdReports as EtoolsPrpAjaxEl).abort();

        self.reduxStore.dispatch(pdReportsFetch(pdReportsThunk, this.pdId))
          .catch(function(err) { // jshint ignore:line
            // TODO: error handling
          });
      });
  }

}

window.customElements.define('pd-details-reports', PdDetailsReport);
