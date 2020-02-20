import {html} from '@polymer/polymer';
import UtilsMixin from '../../mixins/utils-mixin';
import '../etools-prp-toolbar';
import '../download-button';
import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class PdReportsToolbar extends UtilsMixin(ReduxConnectedElement) {
  public static get template(){
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      
      <etools-prp-toolbar
        query="{{ query }}"
        pd-id="{{ pdId }}"
        location-id="{{ locationId }}">
        <template is="dom-if" if="[[canExport]]" restamp="true">
          <download-button url="[[xlsExportUrl]]">XLS</download-button>
          <download-button url="[[pdfExportUrl]]">PDF</download-button>
        </template>
      </etools-prp-toolbar>
    
    `;
  }

  @property({type: Number})
  totalResults!: number;
    // statePath: App.Selectors.ProgrammeDocumentReports.count,

  @property({type: Boolean, computed: '_canExport(totalResults)'})
  canExport!: boolean;

  @property({type: String, computed: '_computePdReportsUrl(locationId)'})
  pdReportsUrl!: string;

  @property({type: Object, computed: '_computePdQuery(pdId)'})
  pdQuery!: GenericObject;

  @property({type: String, computed: '_appendQuery(pdReportsUrl, query, pdQuery, \'export=xlsx\')'})
  xlsExportUrl!: string;

  @property({type: String, computed: '_appendQuery(pdReportsUrl, query, pdQuery, \'export=pdf\')'})
  pdfExportUrl!: string;

  _computePdReportsUrl(locationId: string) {
    return PdReportsToolbarUtils.computePdReportsUrl(locationId);
  }

  _canExport(totalResults: number) {
    return PdReportsToolbarUtils.canExport(totalResults);
  }

  _computePdQuery(pdId: string) {
    return PdReportsToolbarUtils.computePdQuery(pdId);
  }

}

window.customElements.define('pd-reports-toolbar', PdReportsToolbar);
