import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import {computeIndicatorsUrl} from './js/indicators-toolbar-functions';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class IndicatorsToolbar extends UtilsMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-toolbar query="{{query}}" location-id="{{locationId}}">
        <download-button url="[[xlsExportUrl]]" tracker="Indicators Export Xls">XLS</download-button>
        <download-button url="[[pdfExportUrl]]" tracker="Indicators Export Pdf">PDF</download-button>
      </etools-prp-toolbar>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: String})
  locationId!: string;

  @property({type: String, computed: '_computeIndicatorsUrl(locationId)'})
  indicatorsUrl!: string;

  @property({type: String, computed: "_appendQuery(indicatorsUrl, query, 'export=xlsx')"})
  xlsExportUrl!: string;

  @property({type: String, computed: "_appendQuery(indicatorsUrl, query, 'export=pdf')"})
  pdfExportUrl!: string;

  _computeIndicatorsUrl(locationId: string) {
    return computeIndicatorsUrl(locationId);
  }
}

window.customElements.define('indicators-toolbar', IndicatorsToolbar);
