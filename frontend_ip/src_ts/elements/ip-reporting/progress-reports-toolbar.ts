import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import '../../etools-prp-common/elements/download-button';
import {computePdReportsUrl, hasResults} from './js/progress-reports-toolbar-functions';
import {store} from '../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

@customElement('progress-reports-toolbar')
export class ProgressReportsToolbar extends UtilsMixin(connect(store)(LitElement)) {
  static styles = css`
    ${layoutStyles}
    :host {
      display: block;
      position: relative;
      margin-bottom: 25px;
    }
    .right-align {
      text-align: left;
    }
  `;

  @property({type: Object})
  queryParams!: any;

  @property({type: String})
  locationId!: string;

  @property({type: Number})
  totalResults!: number;

  @property({type: Boolean})
  canExport!: boolean;

  @property({type: String})
  pdReportsUrl!: string;

  @property({type: String})
  xlsExportUrl?: string;

  @property({type: String})
  pdfExportUrl?: string;

  stateChanged(state: RootState) {
    if (
      state.app?.routeDetails?.queryParams &&
      !isJsonStrMatch(this.queryParams, state.app?.routeDetails?.queryParams)
    ) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (this.totalResults !== state.progressReports.count) {
      this.totalResults = state.progressReports.count;
    }

    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('totalResults') || changedProperties.has('queryParams')) {
      this.canExport = this._canExport(this.totalResults, this.queryParams);
    }

    if (changedProperties.has('locationId')) {
      this.pdReportsUrl = computePdReportsUrl(this.locationId);
    }

    if (changedProperties.has('pdReportsUrl') || changedProperties.has('queryParams')) {
      this.xlsExportUrl = this._appendQuery(this.pdReportsUrl, this.queryParams, 'export=xlsx');
      this.pdfExportUrl = this._appendQuery(this.pdReportsUrl, this.queryParams, 'export=pdf');
    }
  }

  _canExport(totalResults: number, queryParams: any) {
    const hasData = hasResults(totalResults);
    const status = queryParams?.status;
    const hasStatusSubmittedOrAccepted = status ? status.includes('Acc') || status.includes('Sub') : true;
    return hasData && hasStatusSubmittedOrAccepted;
  }

  render() {
    return html`
      <div class="layout-horizontal right-align">
        ${this.canExport
          ? html`
              <sl-tooltip content="${translate('PROGRESS_REPORTS_EXPORT_STATUS')}">
                <download-button id="btnDownloadPdf" .url="${this.pdfExportUrl}" tracker="Progress Reports Export Pdf">
                  PDF
                </download-button>
              </sl-tooltip>
              <sl-tooltip content="${translate('PROGRESS_REPORTS_EXPORT_STATUS')}">
                <download-button id="btnDownloadXLS" .url="${this.xlsExportUrl}" tracker="Progress Reports Export Xls">
                  XLS
                </download-button>
              </sl-tooltip>
            `
          : html``}
      </div>
    `;
  }
}

export {ProgressReportsToolbar as ProgressReportsToolbarEl};
