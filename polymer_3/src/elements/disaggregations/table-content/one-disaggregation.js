var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-repeat';
import UtilsMixin from '../../../mixins/utils-mixin';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
import { disaggregationTableStyles } from '../../../styles/disaggregation-table-styles';
import { property } from '@polymer/decorators/lib/decorators';
import '../disaggregation-table-row';
/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationMixin
 * @appliesMixin UtilsMixin
 */
class OneDisaggregation extends DisaggregationMixin(UtilsMixin(PolymerElement)) {
    static get template() {
        // language=HTML
        return html `
      ${disaggregationTableStyles}
      <style></style>

      <tr class='horizontal layout headerRow'>
        <th></th>
        <th>Total</th>
      </tr>

      <template is="dom-repeat"
                items="[[rows]]"
                as="row">
        <disaggregation-table-row
            data="[[row]]"
            level-reported="[[data.level_reported]]"
            indicator-type="[[data.display_type]]"
            row-type="middleRow"
            editable="[[editable]]">
        </disaggregation-table-row>
      </template>

      <disaggregation-table-row
          data="[[totalRow]]"
          level-reported="[[data.level_reported]]"
          indicator-type="[[data.display_type]]"
          row-type="totalsRow">
      </disaggregation-table-row>
    `;
    }
    _getColumns(mapping) {
        return (mapping[0] || []).choices;
    }
    _determineTotalRow(data) {
        return {
            title: 'total',
            total: {
                key: '',
                data: data.disaggregation['()']
            }
        };
    }
    _determineRows(columns, data) {
        const self = this;
        return columns.map(function (z) {
            const formatted = self._formatDisaggregationIds([z.id]);
            return {
                title: z.value,
                data: [{
                        key: formatted,
                        data: data.disaggregation[formatted]
                    }]
            };
        }, this);
    }
}
__decorate([
    property({ type: Number })
], OneDisaggregation.prototype, "editable", void 0);
__decorate([
    property({ type: Object })
], OneDisaggregation.prototype, "data", void 0);
__decorate([
    property({ type: Array })
], OneDisaggregation.prototype, "mapping", void 0);
__decorate([
    property({ type: Array, computed: '_determineTotalRow(data)' })
], OneDisaggregation.prototype, "totalRow", void 0);
__decorate([
    property({ type: Array, computed: '_getColumns(mapping)' })
], OneDisaggregation.prototype, "columns", void 0);
__decorate([
    property({ type: Array, computed: '_determineRows(columns, data)' })
], OneDisaggregation.prototype, "rows", void 0);
window.customElements.define('one-disaggregation', OneDisaggregation);
