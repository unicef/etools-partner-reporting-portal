import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../etools-prp-toolbar';
import '../download-button';
import {property} from '@polymer/decorators/lib/decorators';
import {computePdReportsUrl, canExport} from './js/progress-reports-toolbar-functions';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class ProgressReportsToolbar extends UtilsMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-toolbar query="{{query}}" location-id="{{locationId}}">
        <template is="dom-if" if="[[canExport]]" restamp="true">
          <download-button url="[[pdfExportUrl]]">PDF</download-button>
          <download-button url="[[xlsExportUrl]]">XLS</download-button>
        </template>
      </etools-prp-toolbar>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: String})
  locationId!: string;

  @property({type: Number, computed: 'getReduxStateValue(rootState.progressReports.count)'})
  totalResults!: number;

  @property({type: Boolean, computed: '_canExport(totalResults)'})
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

  _canExport(totalResults: number) {
    return canExport(totalResults);
  }
}

window.customElements.define('progress-reports-toolbar', ProgressReportsToolbar);
