import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '../ip-reporting/pd-report-filters.js';
import '../ip-reporting/pd-reports-toolbar.js';
import '../ip-reporting/pd-reports-list.js';
import {EtoolsPrpAjaxEl} from '../../etools-prp-common/elements/etools-prp-ajax.js';
import {pdReportsFetch} from '../../redux/actions/pdReports.js';
import {computePDReportsUrl, computePDReportsParams} from './js/pd-details-reports-functions.js';
import {RootState} from '../../typings/redux.types';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';

@customElement('pd-details-reports')
export class PdDetailsReport extends connect(store)(UtilsMixin(LocalizeMixin(LitElement))) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  query!: string;

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

  stateChanged(state: RootState) {
    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }

    if (this.pdId !== state.programmeDocuments.current) {
      this.pdId = state.programmeDocuments.current;
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

  render() {
    return html`
      ${tableStyles}
      <iron-location .query="${this.query}"></iron-location>
      <iron-query-params
        .paramsString="${this.query}"
        @params-string-changed="${this._handleQueryParamsChange}"
      ></iron-query-params>
      <etools-prp-ajax id="pdReports" .url="${this.pdReportsUrl}" .params="${this.pdReportsParams}"> </etools-prp-ajax>
      <page-body>
        <pd-report-filters></pd-report-filters>
        <pd-reports-toolbar></pd-reports-toolbar>
        <pd-reports-list></pd-reports-list>
      </page-body>
    `;
  }

  private _handleInputChange() {
    if (!this.pdReportsUrl || !this.pdReportsParams || !Object.keys(this.pdReportsParams).length) {
      return;
    }

    debounce(() => {
      const pdReportsThunk = (this.shadowRoot!.getElementById('pdReports') as any as EtoolsPrpAjaxEl).thunk();

      // Cancel the pending request, if any
      (this.shadowRoot!.getElementById('pdReports') as any as EtoolsPrpAjaxEl).abort();

      store.dispatch(pdReportsFetch(pdReportsThunk, this.pdId));
    }, 250);
  }

  private _handleQueryParamsChange(event: CustomEvent) {
    this.queryParams = event.detail.value;
    this.pdReportsParams = computePDReportsParams(this.pdId, this.queryParams);
  }
}
