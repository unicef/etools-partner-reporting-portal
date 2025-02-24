import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../../etools-prp-common/elements/download-button';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {programmeDocumentReportsCount} from '../../redux/selectors/programmeDocumentReports';
import {computePdReportsUrl, canExport, computePdQuery} from './js/pd-reports-toolbar-functions';
import {RootState} from '../../typings/redux.types';
import {store} from '../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';

@customElement('pd-reports-toolbar')
class PdReportsToolbar extends UtilsMixin(connect(store)(LitElement)) {
  static styles = css`
    ${layoutStyles}
    :host {
      display: block;
      margin: 25px 0;
    }
    .right-align {
      text-align: left;
    }
  `;

  @property({type: Object})
  queryParams!: any;

  @property({type: String})
  pdId!: string;

  @property({type: String})
  locationId!: string;

  @property({type: Number, attribute: false})
  totalResults!: number;

  @property({type: Boolean, attribute: false})
  canExport!: boolean;

  @property({type: String, attribute: false})
  pdReportsUrl!: string;

  @property({type: Object, attribute: false})
  pdQuery!: any;

  @property({type: String, attribute: false})
  xlsExportUrl?: string;

  @property({type: String, attribute: false})
  pdfExportUrl?: string;

  render() {
    return html`
      <div class="layout-horizontal right-align">
        ${this.canExport
          ? html`
              <sl-tooltip content="${translate('PROGRESS_REPORTS_EXPORT_STATUS')}">
                <download-button .url="${this.xlsExportUrl}" tracker="PD Reports Export Xls">XLS</download-button>
              </sl-tooltip>
              <sl-tooltip content="${translate('PROGRESS_REPORTS_EXPORT_STATUS')}">
                <download-button .url="${this.pdfExportUrl}" tracker="PD Reports Export Pdf">PDF</download-button>
              </sl-tooltip>
            `
          : ''}
      </div>
    `;
  }

  stateChanged(state: RootState) {
    this.totalResults = programmeDocumentReportsCount(state);

    if (
      state.app?.routeDetails?.queryParams &&
      !isJsonStrMatch(this.queryParams, state.app?.routeDetails?.queryParams)
    ) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }

    if (this.pdId !== state.programmeDocuments.currentPdId) {
      this.pdId = state.programmeDocuments.currentPdId;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('totalResults')) {
      this.canExport = canExport(this.totalResults);
    }
    if (changedProperties.has('locationId')) {
      this.pdReportsUrl = computePdReportsUrl(this.locationId);
    }
    if (changedProperties.has('pdId')) {
      this.pdQuery = computePdQuery(this.pdId);
    }
    if (
      changedProperties.has('pdReportsUrl') ||
      changedProperties.has('queryParams') ||
      changedProperties.has('pdQuery')
    ) {
      this.xlsExportUrl = this._appendQuery(this.pdReportsUrl, this.queryParams, this.pdQuery, 'export=xlsx');
      this.pdfExportUrl = this._appendQuery(this.pdReportsUrl, this.queryParams, this.pdQuery, 'export=pdf');
    }
  }
}

export {PdReportsToolbar as PdReportsToolbarEl};
