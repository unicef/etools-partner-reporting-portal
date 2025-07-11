import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../redux/store';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import '../ip-reporting/pd-report-filters.js';
import '../ip-reporting/pd-reports-toolbar.js';
import '../ip-reporting/pd-reports-list.js';
import {pdReportsFetch} from '../../redux/actions/pdReports.js';
import {computePDReportsUrl, computePDReportsParams} from './js/pd-details-reports-functions.js';
import {RootState} from '../../typings/redux.types';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';

@customElement('pd-details-reports')
export class PdDetailsReport extends connect(store)(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: Object})
  queryParams!: any;

  @property({type: String})
  locationId!: string;

  @property({type: String})
  pdId!: string;

  @property({type: String})
  pdReportsUrl!: string;

  @property({type: Object})
  pdReportsParams!: any;

  @property({type: String})
  pdReportsId!: string;

  render() {
    return html`
      ${tableStyles}
      <page-body>
        <pd-report-filters></pd-report-filters>
        <pd-reports-toolbar></pd-reports-toolbar>
        <pd-reports-list></pd-reports-list>
      </page-body>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._handleInputChange = debounce(this._handleInputChange.bind(this), 250);
  }

  stateChanged(state: RootState) {
    if (!state.app?.routeDetails?.path?.includes('/view/reports')) {
      // is not active page
      return;
    }

    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }

    if (this.pdId !== state.programmeDocuments.currentPdId) {
      this.pdId = state.programmeDocuments.currentPdId;
    }

    if (this.pdReportsId !== state.programmeDocumentReports.current.id) {
      this.pdReportsId = state.programmeDocumentReports.current.id;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('locationId')) {
      this.pdReportsUrl = computePDReportsUrl(this.locationId);
    }

    if (changedProperties.has('pdId') || changedProperties.has('queryParams')) {
      this.pdReportsParams = computePDReportsParams(this.pdId, this.queryParams);
    }

    if (changedProperties.has('pdReportsUrl') || changedProperties.has('pdReportsParams')) {
      this._handleInputChange();
    }
  }

  private _handleInputChange() {
    if (!this.pdReportsUrl || !this.pdReportsParams || !Object.keys(this.pdReportsParams).length) {
      return;
    }

    store.dispatch(
      pdReportsFetch(
        sendRequest({
          method: 'GET',
          endpoint: {url: this.pdReportsUrl},
          params: this.pdReportsParams
        }),
        this.pdId
      )
    );
  }
}
