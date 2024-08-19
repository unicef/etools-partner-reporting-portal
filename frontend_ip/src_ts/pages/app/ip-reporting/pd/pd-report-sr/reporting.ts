import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '../../../../../etools-prp-common/elements/labelled-item.js';
import '../../../../../etools-prp-common/elements/etools-prp-permissions.js';
import '../../../../../elements/ip-reporting/report-attachments.js';
import '../pd-sent-back.js';

import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin.js';
import Endpoints from '../../../../../endpoints.js';

import {reportInfoCurrent} from '../../../../../redux/selectors/reportInfo.js';
import {currentProgrammeDocument} from '../../../../../etools-prp-common/redux/selectors/programmeDocuments.js';
import {pdReportsUpdate} from '../../../../../redux/actions/pdReports.js';
import {RootState} from '../../../../../typings/redux.types.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util.js';
import {store} from '../../../../../redux/store.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util.js';
import {connect} from 'pwa-helpers';
import {translate, get as getTranslation} from 'lit-translate';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles.js';

@customElement('page-pd-report-sr-reporting')
export class PagePdReportSrReporting extends UtilsMixin(connect(store)(LitElement)) {
  static styles = css`
    ${layoutStyles}
    :host {
      display: block;
      margin-bottom: 25px;
    }
    .value {
      font-size: 16px;
      word-wrap: break-word;
    }
    #toggle-button {
      background-color: #0099ff;
      color: #fff;
      font-size: 14px;
      margin-top: 15px;
      margin-right: 0;
    }
  `;

  @property({type: Object})
  localData: any = {};

  @property({type: Object})
  permissions: any = {};

  @property({type: Object})
  data: any = {};

  @property({type: String})
  pdId = '';

  @property({type: Array})
  programmeDocuments: any[] = [];

  @property({type: Object})
  allPdReports: any = {};

  @property({type: String})
  srDescription = '';

  @property({type: String})
  locationId = '';

  @property({type: String})
  reportId = '';

  @property({type: String})
  updateUrl?: string;

  @property({type: String})
  overrideMode = '';

  @property({type: String})
  mode = '';

  @property({type: String})
  computedMode = '';

  @property({type: Object})
  currentReport: any = {};

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('localData')) {
      this._updateData(this.localData);
    }

    if (changedProperties.has('localData') || changedProperties.has('reportId')) {
      this.updateUrl = this._computeUpdateUrl(this.locationId, this.reportId);
    }

    if (
      changedProperties.has('mode') ||
      changedProperties.has('overrideMode') ||
      changedProperties.has('currentReport') ||
      changedProperties.has('permissions')
    ) {
      this.computedMode = this._computeMode(this.mode, this.overrideMode, this.permissions);
    }

    if (
      changedProperties.has('pdId') ||
      changedProperties.has('programmeDocuments') ||
      changedProperties.has('allPdReports') ||
      changedProperties.has('reportId')
    ) {
      this.srDescription = this._computeSrDescription(
        this.pdId,
        this.programmeDocuments,
        this.allPdReports,
        this.reportId
      );
    }
  }

  stateChanged(state: RootState) {
    super.stateChanged(state);

    this.data = this._reportInfoCurrent(state);
    this.currentReport = this._currentProgrammeDocument(state);

    if (this.pdId !== state.programmeDocuments.currentPdId) {
      this.pdId = state.programmeDocuments.currentPdId;
    }
    if (this.programmeDocuments !== state.programmeDocuments.all) {
      this.programmeDocuments = state.programmeDocuments.all;
    }
    if (this.allPdReports !== state.programmeDocumentReports.byPD) {
      this.allPdReports = state.programmeDocumentReports.byPD;
    }
    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
    if (this.reportId !== state.programmeDocumentReports.current.id) {
      this.reportId = state.programmeDocumentReports.current.id;
    }
    if (this.mode !== state.programmeDocumentReports.current.mode) {
      this.mode = state.programmeDocumentReports.current.mode;
    }
  }

  render() {
    return html`
      <pd-sent-back></pd-sent-back>

      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      ></etools-prp-permissions>

      <etools-content-panel no-header>
          <div class="row">
            <div class="col-12 padding-v">
              <labelled-item label="${translate('DESCRIPTION')}">
                <span class="value">${this.srDescription}</span>
              </labelled-item>
            </div>

          <div class="col-12 padding-v">
            <labelled-item label="${translate('NARRATIVE')}">
              ${this.computedMode === 'view'
                ? html` <span class="value">${this._withDefault(this.data.narrative)}</span> `
                : html`
                    <etools-input
                      id="narrative"
                      .value="${this.data.narrative}"
                      no-label-float
                      char-counter
                      .charCount=${this.data?.narrative?.length}
                      maxlength="2000"
                    >
                    </etools-input>
                  `}
            </labelled-item>
          </div>

          <div class="col-12 right-align padding-v">
            ${this.computedMode !== 'view'
              ? html`
                  <etools-button variant="primary" id="toggle-button" @click="${this._handleInput}">
                    ${translate('SAVE')}
                  </etools-button>
                `
              : html``}
          </div>

          <div class="col-12 padding-v">
            <report-attachments ?readonly="${this._equals(this.computedMode, 'view')}"></report-attachments>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateData = debounce(this._updateData.bind(this), 250);
    this.localData = {};
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  _reportInfoCurrent(rootState) {
    return reportInfoCurrent(rootState);
  }

  _currentProgrammeDocument(rootState) {
    return currentProgrammeDocument(rootState);
  }

  _handleInput() {
    const textInput = this.shadowRoot!.querySelector('#narrative') as any;
    if (textInput && textInput.value && textInput.value.trim()) {
      this.localData = {...this.localData, [textInput.id]: textInput.value.trim()};
    }
  }

  _updateData(localData) {
    if (!this.updateUrl || !localData.narrative) {
      return;
    }

    store
      .dispatch(
        pdReportsUpdate(
          sendRequest({
            method: 'PUT',
            endpoint: {url: this.updateUrl},
            body: this.localData
          }),
          this.pdId,
          this.reportId
        )
      )
      .then(() => {
        fireEvent(this, 'toast', {
          text: getTranslation('CHANGES_SAVED'),
          showCloseBtn: true
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  _computeUpdateUrl(locationId, reportId) {
    if (!locationId || !reportId) {
      return;
    }
    return Endpoints.programmeDocumentReportUpdate(locationId, reportId);
  }

  _computeSrDescription(pdId, programmeDocuments, allPdReports, reportId) {
    if (!allPdReports || !allPdReports[pdId]) {
      return '...';
    }

    const progressReport = allPdReports[pdId].find((report) => report.id === parseInt(reportId));
    const progressReportDueDate = progressReport && progressReport.due_date ? progressReport.due_date : null;

    const currentPdReport = (programmeDocuments || []).find((report) => report.id === pdId);

    if (!progressReportDueDate || !currentPdReport) {
      return '...';
    }

    const currentSrReport = (currentPdReport.reporting_periods || []).find(
      (reporting_period) =>
        reporting_period.report_type === 'SR' && new Date(reporting_period.due_date) <= new Date(progressReportDueDate)
    );

    return currentSrReport && currentSrReport.description !== undefined ? currentSrReport.description : '...';
  }

  _computeMode(mode, overrideMode, permissions) {
    return permissions && permissions.savePdReport ? overrideMode || mode : 'view';
  }
}
