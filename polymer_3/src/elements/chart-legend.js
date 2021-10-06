var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/polymer/lib/elements/dom-repeat';
import './etools-prp-number';
import LocalizeMixin from '../mixins/localize-mixin';
import { property } from '@polymer/decorators/lib/decorators';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ChartLegend extends LocalizeMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.rows = [];
        this.colors = [];
    }
    static get template() {
        return html `
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
    _getColor(colors, index) {
        return colors[index];
    }
}
__decorate([
    property({ type: Array })
], ChartLegend.prototype, "rows", void 0);
__decorate([
    property({ type: Array })
], ChartLegend.prototype, "colors", void 0);
window.customElements.define('chart-legend', ChartLegend);
