var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@unicef-polymer/etools-data-table/etools-data-table';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import { disaggregationTableStyles } from '../../styles/disaggregation-table-styles';
import { property } from '@polymer/decorators/lib/decorators';
import './disaggregation-table-cell-number';
import './disaggregation-table-cell-percentage';
import './disaggregation-table-cell-ratio';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableRow extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.editable = 0;
        this.totalEditable = 0;
    }
    static get template() {
        return html `
        ${disaggregationTableStyles}
      <style></style>

      <tr class$="[[_computeClass(rowType)]]">
        <td class="cellTitle">
          <span class="cellValue">[[_capitalizeFirstLetter(data.title)]]</span>
        </td>

        <template is="dom-repeat"
                  items="[[data.data]]">
          <td>
            <template
                is="dom-if"
                if="[[_equals(indicatorType, 'number')]]"
                restamp="true">
              <disaggregation-table-cell-number
                  coords="[[item.key]]"
                  data="[[item.data]]"
                  editable="[[editable]]">
              </disaggregation-table-cell-number>
            </template>

            <template
                is="dom-if"
                if="[[_equals(indicatorType, 'percentage')]]"
                restamp="true">
              <disaggregation-table-cell-percentage
                  coords="[[item.key]]"
                  data="[[item.data]]"
                  editable="[[editable]]">
              </disaggregation-table-cell-percentage>
            </template>
            <template
                is="dom-if"
                if="[[_equals(indicatorType, 'ratio')]]"
                restamp="true">
              <disaggregation-table-cell-ratio
                  coords="[[item.key]]"
                  data="[[item.data]]"
                  editable="[[editable]]">
              </disaggregation-table-cell-ratio>
            </template>
          </td>
        </template>

        <template
            is="dom-if"
            if="[[data.total]]">
          <td class="cellTotal">
            <template
                is="dom-if"
                if="[[_equals(indicatorType, 'number')]]"
                restamp="true">
              <disaggregation-table-cell-number
                  coords="[[data.total.key]]"
                  data="[[data.total.data]]"
                  editable="[[totalEditable]]">
              </disaggregation-table-cell-number>
            </template>

            <template
                is="dom-if"
                if="[[_equals(indicatorType, 'percentage')]]"
                restamp="true">
              <disaggregation-table-cell-percentage
                  coords="[[data.total.key]]"
                  data="[[data.total.data]]"
                  editable="[[totalEditable]]">
              </disaggregation-table-cell-percentage>
            </template>
            <template
                is="dom-if"
                if="[[_equals(indicatorType, 'ratio')]]"
                restamp="true">
              <disaggregation-table-cell-ratio
                  coords="[[data.total.key]]"
                  data="[[data.total.data]]"
                  editable="[[totalEditable]]">
              </disaggregation-table-cell-ratio>
            </template>
          </td>
        </template>
      </tr>

    `;
    }
    static get observers() {
        return ['_setTotalEditable(data.total.key, levelReported, editable)'];
    }
    _computeClass(rowType) {
        return rowType;
    }
    _setTotalEditable(coords, levelReported, editable) {
        this.set('totalEditable', (coords === '()' && levelReported === 0) ? editable : 0);
    }
}
__decorate([
    property({ type: Object })
], DisaggregationTableRow.prototype, "data", void 0);
__decorate([
    property({ type: Number })
], DisaggregationTableRow.prototype, "levelReported", void 0);
__decorate([
    property({ type: String })
], DisaggregationTableRow.prototype, "indicatorType", void 0);
__decorate([
    property({ type: String })
], DisaggregationTableRow.prototype, "rowType", void 0);
__decorate([
    property({ type: Number })
], DisaggregationTableRow.prototype, "editable", void 0);
__decorate([
    property({ type: Number })
], DisaggregationTableRow.prototype, "totalEditable", void 0);
window.customElements.define('disaggregation-table-row', DisaggregationTableRow);
