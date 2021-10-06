var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-repeat';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import { disaggregationTableStyles } from '../../../styles/disaggregation-table-styles';
import { property } from '@polymer/decorators/lib/decorators';
import '../disaggregation-table-row';
/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationMixin
 * @appliesMixin UtilsMixin
 */
class TwoDisaggregations extends UtilsMixin(DisaggregationMixin(PolymerElement)) {
    static get template() {
        // language=HTML
        return html `
      ${disaggregationTableStyles}
      <style></style>

      <tr class='horizontal layout headerRow'>
        <th></th>

        <template is="dom-repeat"
                  items="[[columns]]"
                  as="column">
          <th>[[_capitalizeFirstLetter(column.value)]]</th>
        </template>

        <th>Total</th>
      </tr>

      <template
          is="dom-repeat"
          items="[[rowsForDisplay]]"
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
          data="[[totalsForDisplay]]"
          level-reported="[[data.level_reported]]"
          indicator-type="[[data.display_type]]"
          row-type="totalsRow">
      </disaggregation-table-row>

    `;
    }
    _getColumns(mapping) {
        return (mapping[0] || []).choices;
    }
    _getRows(mapping) {
        return (mapping[1] || []).choices;
    }
    _determineRowsForDisplay(columns, rows) {
        return this._determineRows(this, rows, columns);
    }
    _determineTotals(columns, data) {
        const self = this;
        const columnData = columns.map(function (z) {
            const formatted = self._formatDisaggregationIds([z.id]);
            return {
                key: formatted,
                data: data.disaggregation[formatted]
            };
        }, this);
        return {
            title: 'total',
            data: columnData,
            total: {
                key: '',
                data: data.disaggregation['()']
            }
        };
    }
}
__decorate([
    property({ type: Number })
], TwoDisaggregations.prototype, "editable", void 0);
__decorate([
    property({ type: Object })
], TwoDisaggregations.prototype, "data", void 0);
__decorate([
    property({ type: Array })
], TwoDisaggregations.prototype, "mapping", void 0);
__decorate([
    property({ type: Array, computed: '_getColumns(mapping)' })
], TwoDisaggregations.prototype, "columns", void 0);
__decorate([
    property({ type: Array, computed: '_getRows(mapping)' })
], TwoDisaggregations.prototype, "rows", void 0);
__decorate([
    property({ type: Object, computed: '_determineTotals(columns, data)' })
], TwoDisaggregations.prototype, "totalsForDisplay", void 0);
__decorate([
    property({ type: Object, computed: '_determineRowsForDisplay(columns, rows, data)' })
], TwoDisaggregations.prototype, "rowsForDisplay", void 0);
window.customElements.define('two-disaggregations', TwoDisaggregations);
