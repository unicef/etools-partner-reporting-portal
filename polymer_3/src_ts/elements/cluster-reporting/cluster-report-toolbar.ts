import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import '../etools-prp-toolbar';
import '../download-button';
import '../upload-button';
import '../../elements/etools-prp-permissions';
import {property} from '@polymer/decorators/lib/decorators';
import {fireEvent} from '../../utils/fire-custom-event';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class ClusterReportToolbar extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-permissions
        permissions="{{ permissions }}">
      </etools-prp-permissions>

      <etools-prp-toolbar
        query="{{ query }}"
        response-plan-id="{{responsePlanId}}">
        <download-button url="[[exportUrl]]">[[localize('export')]]</download-button>

        <template
          is="dom-if"
          if="[[_equals(submitted, 0)]]"
          restamp="true">
          <upload-button
            url="[[importUrl]]"
            modal-title="Import Template">
            [[localize('import_template')]]
          </upload-button>
        </template>
        <template
          is="dom-if"
          if="[[_equals(submitted, 0)]]"
          restamp="true">
          <download-button url="[[exportTemplateUrl]]">[[localize('generate_uploader')]]</download-button>
        </template>
      </etools-prp-toolbar>

    `;
  }

  @property({type: Number})
  submitted!: number;

  @property({type: String})
  responsePlanId!: string;

  @property({type: String, computed: '_computeImportTemplateUrl(responsePlanId, query, submitted)'})
  exportTemplateUrl!: string;

  @property({type: String, computed: '_computeExportUrl(responsePlanId, query, submitted)'})
  exportUrl!: string;

  @property({type: String, computed: '_computeImportUrl(responsePlanId)'})
  importUrl!: string;

  // @ts-ignore
  _computeImportTemplateUrl(responsePlanId: string, query: string, submitted: number) {
    // @ts-ignore
    return this._appendQuery(
      Endpoints.clusterIndicatorReportsImportTemplate(responsePlanId),
      query,
      {submitted: submitted}
    );
  }

  // @ts-ignore
  _computeExportUrl(responsePlanId: string, query: string, submitted: number) {
    return this._appendQuery(
      Endpoints.clusterIndicatorReportsExport(responsePlanId),
      query,
      {submitted: submitted}
    );
  }

  _computeImportUrl(responsePlanId: string) {
    return Endpoints.clusterIndicatorReportsImport(responsePlanId);
  }

  _onFileUploaded(e: CustomEvent) {
    e.stopPropagation();

    fireEvent(this, 'template-file-uploaded');
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
  }

}

window.customElements.define('cluster-report-toolbar', ClusterReportToolbar);
