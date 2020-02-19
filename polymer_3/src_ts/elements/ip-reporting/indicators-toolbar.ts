import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../mixins/utils-mixin';
import '../etools-prp-toolbar';
import '../download-button';
//         <link rel="import" href = "js/indicators-toolbar-functions.html" >

// @Lajos
// behaviors: [
//   behaviors: [
// App.Behaviors.UtilsBehavior,
//       ],
// ],

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class IndicatorsToolbar extends UtilsMixin(ReduxConnectedElement) {

  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-toolbar
      query="{{query}}"
      location-id="{{locationId}}"
    >
      <download-button url="[[xlsExportUrl]]">XLS</download-button>
      <download-button url="[[pdfExportUrl]]">PDF</download-button>
    </etools-prp-toolbar>
  `;
  }
  @property({type: String, computed: '_computeIndicatorsUrl(locationId)'})
  indicatorsUrl!: string;

  @property({type: String, computed: '_appendQuery(indicatorsUrl, query, \'export=xlsx\')'})
  xlsExportUrl!: string;

  @property({type: String, computed: '_appendQuery(indicatorsUrl, query, \'export=pdf\')'})
  pdfExportUrl!: string;

  _computeIndicatorsUrl(locationId: string) {
    return IndicatorsToolbarUtils.computeIndicatorsUrl(locationId);
  };
}

window.customElements.define('indicators-toolbar', IndicatorsToolbar);
