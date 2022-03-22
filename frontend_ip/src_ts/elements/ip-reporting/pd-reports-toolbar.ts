import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {programmeDocumentReportsCount} from '../../redux/selectors/programmeDocumentReports';
import {computePdReportsUrl, canExport, computePdQuery} from './js/pd-reports-toolbar-functions';
import {RootState} from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class PdReportsToolbar extends UtilsMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-toolbar query="{{query}}" pd-id="{{pdId}}" location-id="{{locationId}}">
        <template is="dom-if" if="[[canExport]]" restamp="true">
          <download-button url="[[xlsExportUrl]]" tracker="PD Reports Export Xls">XLS</download-button>
          <download-button url="[[pdfExportUrl]]" tracker="PD Reports Export Pdf">PDF</download-button>
        </template>
      </etools-prp-toolbar>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: String})
  pdId!: string;

  @property({type: Number, computed: '_programmeDocumentReportsCount(rootState)'})
  totalResults!: number;

  @property({type: Boolean, computed: '_canExport(totalResults)'})
  canExport!: boolean;

  @property({type: String, computed: '_computePdReportsUrl(locationId)'})
  pdReportsUrl!: string;

  @property({type: Object, computed: '_computePdQuery(pdId)'})
  pdQuery!: GenericObject;

  @property({type: String, computed: "_appendQuery(pdReportsUrl, query, pdQuery, 'export=xlsx')"})
  xlsExportUrl!: string;

  @property({type: String, computed: "_appendQuery(pdReportsUrl, query, pdQuery, 'export=pdf')"})
  pdfExportUrl!: string;

  _programmeDocumentReportsCount(rootState: RootState) {
    return programmeDocumentReportsCount(rootState);
  }

  _computePdReportsUrl(locationId: string) {
    return computePdReportsUrl(locationId);
  }

  _canExport(totalResults: number) {
    return canExport(totalResults);
  }

  _computePdQuery(pdId: string) {
    return computePdQuery(pdId);
  }
}

window.customElements.define('pd-reports-toolbar', PdReportsToolbar);
