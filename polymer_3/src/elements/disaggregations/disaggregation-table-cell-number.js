var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import UtilsMixin from '../../mixins/utils-mixin';
import './disaggregation-table-cell';
import './disaggregation-field';
import '../etools-prp-number';
import { disaggregationTableStyles } from '../../styles/disaggregation-table-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCellNumber extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
      ${disaggregationTableStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      <disaggregation-table-cell data="[[data]]" editable="[[editable]]">
       <template is="dom-if" if="[[editable]]" restamp>
          <disaggregation-field
            slot="editable"
            key="v"
            value="[[data.v]]"
            coords="[[coords]]">
          </disaggregation-field>
        </template>
        <template is="dom-if" if="[[!editable]]" restamp>
          <etools-prp-number slot="non-editable" value="[[data.v]]"></etools-prp-number>
        </template>
      </disaggregation-table-cell>
    `;
    }
    connectedCallback() {
        super.connectedCallback();
        const nullData = this._clone(this.data);
        if (nullData !== undefined && nullData.v === 0) {
            nullData.v = null;
        }
        if (nullData !== undefined && nullData.d === 0) {
            nullData.d = null;
        }
        this.set('data', nullData);
    }
}
__decorate([
    property({ type: Object })
], DisaggregationTableCellNumber.prototype, "data", void 0);
__decorate([
    property({ type: String })
], DisaggregationTableCellNumber.prototype, "coords", void 0);
__decorate([
    property({ type: Number })
], DisaggregationTableCellNumber.prototype, "editable", void 0);
window.customElements.define('disaggregation-table-cell-number', DisaggregationTableCellNumber);
