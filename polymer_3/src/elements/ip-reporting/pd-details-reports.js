var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../etools-prp-common/ReduxConnectedElement';
import { property } from '@polymer/decorators';
import { html } from '@polymer/polymer';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../ip-reporting/pd-report-filters';
import '../ip-reporting/pd-reports-toolbar';
import '../ip-reporting/pd-reports-list';
import { tableStyles } from '../../etools-prp-common/styles/table-styles';
import Endpoints from '../../endpoints';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { pdReportsFetch } from '../../redux/actions/pdReports';
import { computePDReportsUrl, computePDReportsParams } from './js/pd-details-reports-functions';
import { pdFetch } from '../../redux/actions/pd';
/**
 * @polymer
 * @customElement
 */
class PdDetailsReport extends ReduxConnectedElement {
    static get template() {
        return html `
      ${tableStyles}
      <style include="data-table-styles">
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="programmeDocuments" url="[[programmeDocumentsUrl]]"> </etools-prp-ajax>

      <etools-prp-ajax id="pdReports" url="[[pdReportsUrl]]" params="[[pdReportsParams]]"> </etools-prp-ajax>

      <page-body>
        <pd-report-filters></pd-report-filters>
        <pd-reports-toolbar></pd-reports-toolbar>
        <pd-reports-list></pd-reports-list>
      </page-body>
    `;
    }
    static get observers() {
        return ['_handleInputChange(pdReportsUrl, pdReportsParams)'];
    }
    _computePDReportsUrl(locationId) {
        return computePDReportsUrl(locationId);
    }
    _computePDReportsParams(pdId, queryParams) {
        return computePDReportsParams(pdId, queryParams);
    }
    _computeProgrammeDocumentsUrl(locationId) {
        return locationId ? Endpoints.programmeDocuments(locationId) : '';
    }
    _handleInputChange(url) {
        if (!url || !this.queryParams || !Object.keys(this.queryParams).length) {
            return;
        }
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
            const pdReportsThunk = this.$.pdReports.thunk();
            // Cancel the pending request, if any
            this.$.pdReports.abort();
            this.reduxStore
                .dispatch(pdReportsFetch(pdReportsThunk, this.pdId))
                // @ts-ignore
                .catch(function (err) {
                console.log(err);
            });
        });
    }
    _getPdReports() {
        // Status being present prevents res.data from getting reports,
        // preventing pd-details title from rendering. Deleting the status
        // can resolve this issue, and filter will still work
        if (this.pdReportsCount[this.pdId] > 0 && this.pdReportsId === '') {
            this.fetchPdsDebouncer = Debouncer.debounce(this.fetchPdsDebouncer, timeOut.after(100), () => {
                const pdThunk = this.$.programmeDocuments;
                pdThunk.params = {
                    page: 1,
                    page_size: 10,
                    programme_document: this.pdId
                };
                // Cancel the pending request, if any
                this.$.programmeDocuments.abort();
                this.reduxStore
                    .dispatch(pdFetch(pdThunk.thunk()))
                    // @ts-ignore
                    .catch(function (err) {
                    console.log(err);
                });
            });
        }
    }
}
__decorate([
    property({ type: String })
], PdDetailsReport.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], PdDetailsReport.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PdDetailsReport.prototype, "locationId", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocuments.current)' })
], PdDetailsReport.prototype, "pdId", void 0);
__decorate([
    property({ type: String, computed: '_computePDReportsUrl(locationId)' })
], PdDetailsReport.prototype, "pdReportsUrl", void 0);
__decorate([
    property({ type: Object, computed: '_computePDReportsParams(pdId, queryParams)' })
], PdDetailsReport.prototype, "pdReportsParams", void 0);
__decorate([
    property({ type: String, computed: '_computeProgrammeDocumentsUrl(locationId)' })
], PdDetailsReport.prototype, "programmeDocumentsUrl", void 0);
__decorate([
    property({
        type: Object,
        computed: 'getReduxStateValue(rootState.programmeDocumentReports.countByPD)',
        observer: '_getPdReports'
    })
], PdDetailsReport.prototype, "pdReportsCount", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.programmeDocumentReports.current.id)' })
], PdDetailsReport.prototype, "pdReportsId", void 0);
window.customElements.define('pd-details-reports', PdDetailsReport);
