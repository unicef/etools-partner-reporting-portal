import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import '../etools-prp-toolbar';
import '../../etools-prp-common/elements/download-button';
import {computePdUrl} from './js/pd-list-toolbar-functions';

class PdListToolbar extends UtilsMixin(PolymerElement) {
  public static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      <etools-prp-toolbar query="{{query}}" location-id="{{locationId}}">
        <!-- TODO: Possibly use https://www.webcomponents.org/element/Collaborne/iron-file-icons for different files? -->
        <download-button url="[[pdfExportUrl]]" tracker="Programme Documents Export Pdf">PDF</download-button>
        <download-button url="[[xlsxExportUrl]]" tracker="Programme Documents Export Xlsx">XLS</download-button>
      </etools-prp-toolbar>
    `;
  }

  @property({type: String})
  query!: string;

  @property({type: String})
  locationId!: string;

  @property({type: String, computed: '_computePdUrl(locationId)'})
  pdUrl!: string;

  @property({type: String, computed: "_appendQuery(pdUrl, query, 'export=xlsx')"})
  xlsxExportUrl!: string;

  @property({type: String, computed: "_appendQuery(pdUrl, query, 'export=pdf')"})
  pdfExportUrl!: string;

  _computePdUrl(locationId: string) {
    return computePdUrl(locationId);
  }
}

window.customElements.define('pd-list-toolbar', PdListToolbar);

export {PdListToolbar as PdListToolbarEl};
