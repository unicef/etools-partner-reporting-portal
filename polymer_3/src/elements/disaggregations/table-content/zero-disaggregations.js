var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { disaggregationTableStyles } from '../../../styles/disaggregation-table-styles';
import { property } from '@polymer/decorators';
import '../disaggregation-table-row';
/**
 * @polymer
 * @customElement
 */
class ZeroDisaggregations extends PolymerElement {
    static get template() {
        // language=HTML
        return html `
        ${disaggregationTableStyles}
      <style></style>

      <disaggregation-table-row
          data="[[totalRow]]"
          level-reported="[[data.level_reported]]"
          indicator-type="[[data.display_type]]"
          row-type="totalsRow"
          editable="[[editable]]">
      </disaggregation-table-row>
    `;
    }
    _determineTotalRow(_, data) {
        return {
            title: 'total',
            total: {
                key: '()',
                data: data.disaggregation['()']
            }
        };
    }
}
__decorate([
    property({ type: Number })
], ZeroDisaggregations.prototype, "editable", void 0);
__decorate([
    property({ type: Object })
], ZeroDisaggregations.prototype, "data", void 0);
__decorate([
    property({ type: Array, computed: '_determineTotalRow(mapping, data)' })
], ZeroDisaggregations.prototype, "totalRow", void 0);
window.customElements.define('zero-disaggregations', ZeroDisaggregations);
