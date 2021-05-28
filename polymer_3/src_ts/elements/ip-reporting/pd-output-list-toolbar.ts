import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-button/paper-button.js';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';
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

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdOutputListToolbar extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      ${buttonsStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-ajax
        id="refreshReport"
        url="[[refreshUrl]]"
        body="[[refreshData]]"
        method="post"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <refresh-report-modal id="refresh" data="[[refreshData]]" refresh-url="[[refreshUrl]]"> </refresh-report-modal>

      <etools-prp-toolbar query="{{query}}" report-id="{{reportId}}" location-id="{{locationId}}">
        <download-button url="[[pdfExportUrl]]">PDF</download-button>
        <download-button url="[[xlsExportUrl]]">XLS</download-button>

        <template is="dom-if" if="[[showImportButtons]]" restamp="true">
          <upload-button url="[[importUrl]]" modal-title="Import Template">
            [[localize('import_template')]]
          </upload-button>
          <download-button url="[[importTemplateUrl]]">[[localize('generate_uploader')]]</download-button>
          <template is="dom-if" if="[[showRefresh]]" restamp="true">
            <paper-button class="btn-primary" on-tap="_refresh" disabled="[[busy]]" raised>
              [[localize('refresh')]]
            </paper-button>
          </template>
        </template>
      </etools-prp-toolbar>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: String})
  locationId!: string;

  @property({type: Object, computed: '_programmeDocumentReportsCurrent(rootState)'})
  programmeDocument!: GenericObject;

  @property({type: Boolean, computed: '_computeShowImportButtons(programmeDocument)'})
  showImportButtons!: boolean;

  @property({type: String, computed: '_computeImportTemplateUrl(locationId, reportId)'})
  importTemplateUrl!: string;

  @property({type: String, computed: '_computeImportUrl(locationId, reportId)'})
  importUrl!: string;

  @property({type: String, computed: '_computePdReportUrl(locationId, reportId)'})
  pdReportUrl!: string;

  @property({type: String, computed: "_appendQuery(pdReportUrl, query, 'export=pdf')"})
  pdfExportUrl!: string;

  @property({type: String, computed: "_appendQuery(pdReportUrl, query, 'export=xlsx')"})
  xlsExportUrl!: string;

  @property({type: Object, computed: '_programmeDocumentReportsCurrent(rootState)'})
  currentReport!: GenericObject;

  @property({type: Array, computed: 'getReduxStateArray(rootState.userProfile.profile.prp_roles)'})
  currentUserRoles!: any[];

  @property({type: Object, computed: '_computeRefreshData(reportId)'})
  refreshData!: GenericObject;

  @property({type: Boolean, computed: '_computeCanRefresh(currentReport, programmeDocument)'})
  canRefresh = false;

  @property({type: Boolean, computed: '_computeShowRefresh(canRefresh, currentUserRoles)'})
  showRefresh = false;

  @property({type: String})
  reportId!: string;

  @property({type: String})
  refreshUrl = Endpoints.reportProgressReset();

  _programmeDocumentReportsCurrent(rootState: RootState) {
    return programmeDocumentReportsCurrent(rootState);
  }

  _computeImportTemplateUrl(locationId: string, reportId: string) {
    return computeImportTemplateUrl(locationId, reportId);
  }

  _computeImportUrl(locationId: string, reportId: string) {
    return computeImportUrl(locationId, reportId);
  }

  _computeShowImportButtons(programmeDocument: GenericObject) {
    return computeShowImportButtons(programmeDocument);
  }

  _computePdReportUrl(locationId: string, reportId: string) {
    return computePdReportUrl(locationId, reportId);
  }

  _computeRefreshData(reportId: string) {
    return computeRefreshData(reportId);
  }

  _computeCanRefresh(report: GenericObject, programmeDocument: GenericObject) {
    return computeCanRefresh(report, programmeDocument);
  }

  _computeShowRefresh(canRefresh: boolean, currentUserRoles: any[]) {
    return canRefresh && computeShowRefresh(currentUserRoles);
  }

  _refresh() {
    (this.$.refresh as RefreshReportModalEl).open();
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
    (this.$.refresh as RefreshReportModalEl).close();
  }
}

window.customElements.define('pd-output-list-toolbar', PdOutputListToolbar);

export {PdOutputListToolbar as PdOutputListToolbarEl};
