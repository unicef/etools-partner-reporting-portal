import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/paper-tooltip/paper-tooltip';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from 'lit-translate';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import {computePdReportsUrl, hasResults} from './js/progress-reports-toolbar-functions';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';
import {RootState} from '../../typings/redux.types';

@customElement('progress-reports-toolbar')
export class ProgressReportsToolbar extends UtilsMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
      position: relative;
    }
  `;

  @property({type: String})
  query!: string;

  @property({type: Object})
  params!: any;

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
    if (this.totalResults !== state.progressReports.count) {
      this.totalResults = state.progressReports.count;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('totalResults') || changedProperties.has('params')) {
      this.canExport = this._canExport(this.totalResults, this.params);
    }

    if (changedProperties.has('locationId')) {
      this.pdReportsUrl = computePdReportsUrl(this.locationId);
    }

    if (changedProperties.has('pdReportsUrl') || changedProperties.has('query')) {
      this.xlsExportUrl = this._appendQuery(this.pdReportsUrl, this.query, 'export=xlsx');
      this.pdfExportUrl = this._appendQuery(this.pdReportsUrl, this.query, 'export=pdf');
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
      <etools-prp-toolbar .query="${this.query}" .params="${this.params}" .locationId="${this.locationId}">
        ${this.canExport
          ? html`
              <download-button id="btnDownloadPdf" .url="${this.pdfExportUrl}" tracker="Progress Reports Export Pdf">
                PDF
              </download-button>
              <paper-tooltip for="btnDownloadPdf" fit-to-visible-bounds>
                ${translate('PROGRESS_REPORTS_EXPORT_STATUS')}
              </paper-tooltip>
              <download-button id="btnDownloadXLS" .url="${this.xlsExportUrl}" tracker="Progress Reports Export Xls">
                XLS
              </download-button>
              <paper-tooltip for="btnDownloadXLS" fit-to-visible-bounds>
                ${translate('PROGRESS_REPORTS_EXPORT_STATUS')}
              </paper-tooltip>
            `
          : html``}
      </etools-prp-toolbar>
    `;
  }
}

export {ProgressReportsToolbar as ProgressReportsToolbarEl};
