import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {property} from '@polymer/decorators';
import {html} from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../ip-reporting/pd-report-filters';
import '../ip-reporting/pd-reports-toolbar';
import '../ip-reporting/pd-reports-list';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax';
import {pdReportsFetch} from '../../redux/actions/pdReports';
import {computePDReportsUrl, computePDReportsParams} from './js/pd-details-reports-functions';

/**
 * @polymer
 * @customElement
 */
class PdDetailsReport extends ReduxConnectedElement {
  static get template() {
    return html`
      ${tableStyles}
      <style include="data-table-styles">
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="pdReports" url="[[pdReportsUrl]]" params="[[pdReportsParams]]"> </etools-prp-ajax>

      <page-body>
        <pd-report-filters></pd-report-filters>
        <pd-reports-toolbar></pd-reports-toolbar>
        <pd-reports-list></pd-reports-list>
      </page-body>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)'})
  pdId!: string;

  @property({type: String, computed: '_computePDReportsUrl(locationId)'})
  pdReportsUrl!: string;

  @property({type: Object, computed: '_computePDReportsParams(pdId, queryParams)'})
  pdReportsParams!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)'})
  pdReportsId!: string;

  private _debouncer!: Debouncer;

  public static get observers() {
    return ['_handleInputChange(pdReportsUrl, pdReportsParams)'];
  }

  _computePDReportsUrl(locationId: string) {
    return computePDReportsUrl(locationId);
  }

  _computePDReportsParams(pdId: string, queryParams: GenericObject) {
    return computePDReportsParams(pdId, queryParams);
  }

  _handleInputChange(url: string) {
    if (!url || !this.queryParams || !Object.keys(this.queryParams).length) {
      return;
    }

    this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
      const pdReportsThunk = (this.$.pdReports as EtoolsPrpAjaxEl).thunk();

      // Cancel the pending request, if any
      (this.$.pdReports as EtoolsPrpAjaxEl).abort();

      this.reduxStore
        .dispatch(pdReportsFetch(pdReportsThunk, this.pdId))
        // @ts-ignore
        .catch(function (err) {
          console.log(err);
        });
    });
  }
}

window.customElements.define('pd-details-reports', PdDetailsReport);
