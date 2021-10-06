var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import UtilsMixin from '../../mixins/utils-mixin';
import { disaggregationTableStyles } from '../../styles/disaggregation-table-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCell extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
        ${disaggregationTableStyles}
      <style>
        :host {
          display: block;
        }

      </style>

      <template
        is="dom-if"
        if="[[editableBool]]">
        <slot name="editable"></slot>
      </template>

      <template
        is="dom-if"
        if="[[!editableBool]]">
        <span class="cellValue">
          <template
            is="dom-if"
            if="[[noValue]]"
            restamp="true">
            0
          </template>
          <template
            is="dom-if"
            if="[[!noValue]]"
            restamp="true">
            <slot name="non-editable"></slot>
          </template>
        </span>
      </template>

    `;
    }
    _computeEditableBool(editable) {
        return editable === 1;
    }
    _computeNoValue(data) {
        return data ? !data.c && !data.d && !data.v : true;
    }
}
__decorate([
    property({ type: Object })
], DisaggregationTableCell.prototype, "data", void 0);
__decorate([
    property({ type: Number })
], DisaggregationTableCell.prototype, "editable", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeEditableBool(editable)' })
], DisaggregationTableCell.prototype, "editableBool", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeNoValue(data)' })
], DisaggregationTableCell.prototype, "noValue", void 0);
window.customElements.define('disaggregation-table-cell', DisaggregationTableCell);
