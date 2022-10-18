import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/paper-tooltip/paper-tooltip';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import {property} from '@polymer/decorators/lib/decorators';
import {computePdReportsUrl, hasResults} from './js/progress-reports-toolbar-functions';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class ProgressReportsToolbar extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-toolbar query="{{query}}" params="{{params}}" location-id="{{locationId}}">
        <template is="dom-if" if="[[canExport]]" restamp="true">
          <download-button id="btnDownloadPdf" url="[[pdfExportUrl]]" tracker="Progress Reports Export Pdf"
            >PDF</download-button
          >
          <paper-tooltip for="btnDownloadPdf">[[localize('progress_reports_export_status')]]</paper-tooltip>

          <download-button id="btnDownloadXLS" url="[[xlsExportUrl]]" tracker="Progress Reports Export Xls"
            >XLS</download-button
          >
          <paper-tooltip for="btnDownloadXLS">[[localize('progress_reports_export_status')]]</paper-tooltip>
        </template>
      </etools-prp-toolbar>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: Object})
  params!: GenericObject;

  @property({type: String})
  locationId!: string;

  @property({type: Number, computed: 'getReduxStateValue(rootState.progressReports.count)'})
  totalResults!: number;

  @property({type: Boolean, computed: '_canExport(totalResults, params)'})
  canExport!: boolean;

  @property({type: String, computed: '_computePdReportsUrl(locationId)'})
  pdReportsUrl!: string;

  @property({type: String, computed: "_appendQuery(pdReportsUrl, query, 'export=xlsx')"})
  xlsExportUrl!: string;

  @property({type: String, computed: "_appendQuery(pdReportsUrl, query, 'export=pdf')"})
  pdfExportUrl!: string;

  _computePdReportsUrl(locationId: string) {
    return computePdReportsUrl(locationId);
  }

  _canExport(totalResults: number, queryParams: GenericObject) {
    // show Export buttons if have data and status Accepted or Submitted is selected
    const hasData = hasResults(totalResults);
    const status = queryParams.status;
    const hasStatusSubmittedOrAccepted = status ? status.includes('Acc') || status.includes('Sub') : true;
    return hasData && hasStatusSubmittedOrAccepted;
  }
}

window.customElements.define('progress-reports-toolbar', ProgressReportsToolbar);
