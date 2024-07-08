import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import Endpoints from '../../endpoints';
import {buttonsStyles} from '../../etools-prp-common/styles/buttons-styles';
import {programmeDocumentReportsCurrent} from '../../redux/selectors/programmeDocumentReports';
import {
  computeImportTemplateUrl,
  computeImportUrl,
  computeShowImportButtons,
  computePdReportUrl,
  computeRefreshData,
  computeCanRefresh,
  computeShowRefresh
} from './js/pd-output-list-toolbar-functions';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/etools-prp-ajax';
import '../../etools-prp-common/elements/refresh-report-modal';
import {RefreshReportModalEl} from '../../etools-prp-common/elements/refresh-report-modal';
import '../../etools-prp-common/elements/download-button';
import '../../etools-prp-common/elements/upload-button';
import {RootState} from '../../typings/redux.types';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';

@customElement('pd-output-list-toolbar')
export class PdOutputListToolbar extends LocalizeMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String})
  query!: string;

  @property({type: String})
  locationId!: string;

  @property({type: String})
  reportId!: string;

  @property({type: String})
  refreshUrl = Endpoints.reportProgressReset();

  @property({type: Boolean})
  showImportButtons = false;

  @property({type: String})
  importTemplateUrl!: string;

  @property({type: String})
  importUrl!: string;

  @property({type: String})
  pdReportUrl!: string;

  @property({type: String})
  pdfExportUrl?: string;

  @property({type: String})
  xlsExportUrl?: string;

  @property({type: Object})
  currentReport: any = null;

  @property({type: Object})
  refreshData: any = null;

  @property({type: Boolean})
  canRefresh = false;

  @property({type: Boolean})
  showRefresh = false;

  @property({type: Array})
  currentUserRoles: any[] = [];

  stateChanged(state: RootState) {
    this.programmeDocument = programmeDocumentReportsCurrent(state);
    this.currentReport = programmeDocumentReportsCurrent(state);
    this.currentUserRoles = state.userProfile?.profile?.prp_roles;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('locationId') || changedProperties.has('reportId')) {
      this.importTemplateUrl = computeImportTemplateUrl(this.locationId, this.reportId);
      this.importUrl = computeImportUrl(this.locationId, this.reportId);
      this.pdReportUrl = computePdReportUrl(this.locationId, this.reportId);
    }

    if (changedProperties.has('pdReportUrl') || changedProperties.has('query')) {
      this.pdfExportUrl = this._appendQuery(this.pdReportUrl, this.query, 'export=pdf');
      this.xlsExportUrl = this._appendQuery(this.pdReportUrl, this.query, 'export=xlsx');
    }

    if (changedProperties.has('reportId')) {
      this.refreshData = computeRefreshData(this.reportId);
    }

    if (changedProperties.has('programmeDocument')) {
      this.showImportButtons = computeShowImportButtons(this.programmeDocument);
    }

    if (changedProperties.has('currentReport') || changedProperties.has('programmeDocument')) {
      this.canRefresh = computeCanRefresh(this.currentReport, this.programmeDocument);
    }

    if (changedProperties.has('programmeDocument') || changedProperties.has('canRefresh')) {
      this.showRefresh = this.canRefresh && computeShowRefresh(this.currentUserRoles);
    }
  }

  render() {
    return html`
      ${buttonsStyles}

      <etools-prp-ajax
        id="refreshReport"
        url="${this.refreshUrl}"
        body="${JSON.stringify(this.refreshData)}"
        method="post"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <refresh-report-modal id="refresh" data="${JSON.stringify(this.refreshData)}" refresh-url="${this.refreshUrl}">
      </refresh-report-modal>

      <etools-prp-toolbar query="${this.query}" report-id="${this.reportId}" location-id="${this.locationId}">
        <download-button url="${this.pdfExportUrl}" tracker="PD Report Export Pdf">PDF</download-button>
        <download-button url="${this.xlsExportUrl}" tracker="PD Report Export Xls">XLS</download-button>

        ${this.showImportButtons
          ? html`
              <upload-button url="${this.importUrl}" modal-title="Import Template">
                ${this.localize('import_template')}
              </upload-button>
              <download-button url="${this.importTemplateUrl}" tracker="Import template">
                ${this.localize('generate_uploader')}
              </download-button>
              ${this.showRefresh
                ? html`
                    <paper-button class="btn-primary" @click="${this._refresh}" ?disabled="${this.busy}" raised>
                      ${this.localize('refresh')}
                    </paper-button>
                  `
                : ''}
            `
          : ''}
      </etools-prp-toolbar>
    `;
  }

  _refresh() {
    (this.shadowRoot?.getElementById('refresh') as RefreshReportModalEl)?.open();
  }

  _onFileUploaded(e: CustomEvent) {
    e.stopPropagation();
    window.location.reload();
  }

  _addEventListeners() {
    this._onFileUploaded = this._onFileUploaded.bind(this);
    this.addEventListener('file-uploaded', this._onFileUploaded as any);
  }

  _removeEventListeners() {
    this.removeEventListener('file-uploaded', this._onFileUploaded as any);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
    (this.shadowRoot?.getElementById('refresh') as RefreshReportModalEl)?.close();
  }
}

export {PdOutputListToolbar as PdOutputListToolbarEl};
