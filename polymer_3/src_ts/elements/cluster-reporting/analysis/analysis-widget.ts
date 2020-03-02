import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-loading';
import {analysisWidgetStyles} from '../../../styles/analysis-widget-styles';
/**
* @polymer
* @customElement
* @mixinFunction
* @appliesMixin UtilsMixin
*/
class AnalysisWidget extends PolymerElement {

  static get template() {
    return html`
    ${analysisWidgetStyles}
    <div class="analysis-widget">
      <h3 class="analysis-widget__header">[[widgetTitle]]</h3>
      <div class="analysis-widget__body">
        <content></content>
      </div>
      <etools-loading active="[[loading]]"></etools-loading>
    </div>
    `;
  }

  @property({type: String})
  widgetTitle!: string;

  @property({type: Boolean})
  loading = false;
}

window.customElements.define('analysis-widget', AnalysisWidget);
