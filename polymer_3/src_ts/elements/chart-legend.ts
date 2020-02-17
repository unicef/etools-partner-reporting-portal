import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/polymer/lib/elements/dom-repeat';
import './etools-prp-number';
import LocalizeMixin from '../mixins/localize-mixin';
import {property} from '@polymer/decorators/lib/decorators';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ChartLegend extends LocalizeMixin(PolymerElement){
  public static get template(){
    return html`
      <style include="iron-flex iron-flex-alignment">
        :host {
          display: block;
        }
  
        .legend {
          padding: 0;
          margin: 0;
          list-style: none;
          font-size: 12px;
          line-height: 1;
        }
  
        .legend-row {
          padding: 0 .5em .5em;
          border-bottom: 1px solid var(--paper-grey-200);
        }
  
        .legend-row:not(:last-child) {
          margin-bottom: .75em;
        }
  
        .color {
          display: inline-block;
          vertical-align: middle;
          width: .5em;
          height: 1.25em;
          margin-right: .25em;
          position: relative;
          top: -1px;
        }
      </style>
      
      <ul class="legend">
        <template
            is="dom-repeat"
            items="[[rows]]">
          <li class="legend-row layout horizontal justified">
            <span>
              <span
                  class="color"
                  style="background: [[_getColor(colors, index)]];">
              </span>
              [[localize(item.0)]]
            </span>
            <etools-prp-number value="[[item.1]]"></etools-prp-number>
          </li>
        </template>
      </ul>
    
    `;
  }

  @property({type: Array})
  rows: string[] = [];

  @property({type: Array})
  colors: string[] = [];

  public _getColor(colors: string[], index: string) {
    return colors[index];
  }

}

window.customElements.define('chart-legend', ChartLegend);
