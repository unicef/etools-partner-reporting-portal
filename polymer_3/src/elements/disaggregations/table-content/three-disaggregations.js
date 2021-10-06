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
class ThreeDisaggregations extends DisaggregationMixin(UtilsMixin(PolymerElement)) {
    static get template() {
        // language=HTML
        return html `
      ${disaggregationTableStyles}
      <style></style>

      <!-- Column names -->
      <tr class="horizontal layout headerRow">
        <th></th>
        <template is="dom-repeat"
                  items="[[columns]]"
                  as="column">
          <th>[[_capitalizeFirstLetter(column.value)]]</th>
        </template>
        <th>Total</th>
      </tr>

      <!-- Data rows: outer and middle. -->
      <template is="dom-repeat"
                items="[[outerRowsForDisplay]]"
                as="outerRow">
        <disaggregation-table-row
            data="[[outerRow]]"
            level-reported="[[data.level_reported]]"
            indicator-type="[[data.display_type]]"
            row-type="outerRow">
        </disaggregation-table-row>

        <template
            is="dom-repeat"
            items="[[_determineMiddleRows(outerRow.id, columns, middleRows, data)]]"
            as="middleRow">
          <disaggregation-table-row
              data="[[middleRow]]"
              level-reported="[[data.level_reported]]"
              indicator-type="[[data.display_type]]"
              row-type="middleRow"
              editable="[[editable]]">
          </disaggregation-table-row>
        </template>

     </template>

     <!-- Totals row -->
     <disaggregation-table-row
        data="[[columnTotalRow]]"
        level-reported="[[data.level_reported]]"
        indicator-type="[[data.display_type]]"
        row-type="totalsRow">
     </disaggregation-table-row>

     <!-- Bottom table -->
     <template is="dom-repeat"
               items="[[bottomRows]]"
               as="bottomRow">
      <disaggregation-table-row
          data="[[bottomRow]]"
          level-reported="[[data.level_reported]]"
          indicator-type="[[data.display_type]]"
          row-type="bottomRow">
      </disaggregation-table-row>
    </template>
    `;
    }
    static get observers() {
        return ['_determineTotals(columns, middleRows, data)'];
    }
    _getColumns(mapping) {
        return (mapping[0] || []).choices;
    }
    _getRows(mapping) {
        return (mapping[1] || []).choices;
    }
    _getMiddleRows(mapping) {
        return (mapping[2] || []).choices;
    }
    _determineOuterRows(columns, rows) {
        return this._determineRows(this, rows, columns);
    }
    _determineMiddleRows(outerRowID, columns, middleRows, data) {
        if (!columns || !middleRows) {
            return [];
        }
        const self = this;
        return middleRows.map(function (y) {
            let formatted;
            const columnData = columns.map(function (z) {
                formatted = self._formatDisaggregationIds([outerRowID, y.id, z.id]);
                return {
                    key: formatted,
                    data: data.disaggregation[formatted],
                };
            }, self);
            formatted = self._formatDisaggregationIds([outerRowID, y.id]);
            return {
                title: y.value,
                data: columnData,
                id: y.id,
                total: {
                    key: formatted,
                    data: data.disaggregation[formatted],
                },
            };
        }, this);
    }
    _determineTotals(columns, middleRows, data) {
        const self = this;
        const columnData = columns.map(function (z) {
            const formatted = self._formatDisaggregationIds([z.id]);
            return {
                key: formatted,
                data: data.disaggregation[formatted]
            };
        }, self);
        const columnTotalRow = {
            title: 'total',
            data: columnData,
            total: {
                key: '',
                data: data.disaggregation['()']
            }
        };
        this.set('columnTotalRow', columnTotalRow);
        this.set('bottomRows', this._determineRows(this, middleRows, columns));
    }
}
__decorate([
    property({ type: Number })
], ThreeDisaggregations.prototype, "editable", void 0);
__decorate([
    property({ type: Object })
], ThreeDisaggregations.prototype, "data", void 0);
__decorate([
    property({ type: Array })
], ThreeDisaggregations.prototype, "mapping", void 0);
__decorate([
    property({ type: Object })
], ThreeDisaggregations.prototype, "columnTotalRow", void 0);
__decorate([
    property({ type: Array, computed: '_getColumns(mapping)' })
], ThreeDisaggregations.prototype, "columns", void 0);
__decorate([
    property({ type: Array, computed: '_getRows(mapping)' })
], ThreeDisaggregations.prototype, "rows", void 0);
__decorate([
    property({ type: Array, computed: '_getMiddleRows(mapping)' })
], ThreeDisaggregations.prototype, "middleRows", void 0);
__decorate([
    property({ type: Array, computed: '_determineOuterRows(columns, rows, data)' })
], ThreeDisaggregations.prototype, "outerRowsForDisplay", void 0);
window.customElements.define('three-disaggregations', ThreeDisaggregations);
