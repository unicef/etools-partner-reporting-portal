import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-repeat';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import {disaggregationTableStyles} from '../../../styles/disaggregation-table-styles';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../typings/globals.types';
import '../disaggregation-table-row';

/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationMixin
 * @appliesMixin UtilsMixin
 */
class ThreeDisaggregations extends DisaggregationMixin(UtilsMixin(PolymerElement)) {
  public static get template() {
    // language=HTML
    return html`
      ${disaggregationTableStyles}
      <style></style>

      <!-- Column names -->
      <tr class="horizontal layout headerRow">
        <th></th>
        <template is="dom-repeat" items="[[columns]]" as="column">
          <th>[[_capitalizeFirstLetter(column.value)]]</th>
        </template>
        <th>Total</th>
      </tr>

      <!-- Data rows: outer and middle. -->
      <template is="dom-repeat" items="[[outerRowsForDisplay]]" as="outerRow">
        <disaggregation-table-row
          data="[[outerRow]]"
          level-reported="[[data.level_reported]]"
          indicator-type="[[data.display_type]]"
          row-type="outerRow"
        >
        </disaggregation-table-row>

        <template
          is="dom-repeat"
          items="[[_determineMiddleRows(outerRow.id, columns, middleRows, data)]]"
          as="middleRow"
        >
          <disaggregation-table-row
            data="[[middleRow]]"
            level-reported="[[data.level_reported]]"
            indicator-type="[[data.display_type]]"
            row-type="middleRow"
            editable="[[editable]]"
          >
          </disaggregation-table-row>
        </template>
      </template>

      <!-- Totals row -->
      <disaggregation-table-row
        data="[[columnTotalRow]]"
        level-reported="[[data.level_reported]]"
        indicator-type="[[data.display_type]]"
        row-type="totalsRow"
      >
      </disaggregation-table-row>

      <!-- Bottom table -->
      <template is="dom-repeat" items="[[bottomRows]]" as="bottomRow">
        <disaggregation-table-row
          data="[[bottomRow]]"
          level-reported="[[data.level_reported]]"
          indicator-type="[[data.display_type]]"
          row-type="bottomRow"
        >
        </disaggregation-table-row>
      </template>
    `;
  }

  static get observers() {
    return ['_determineTotals(columns, middleRows, data)'];
  }

  @property({type: Number})
  editable!: number;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Array})
  mapping!: any[];

  @property({type: Object})
  columnTotalRow!: GenericObject;

  @property({type: Array, computed: '_getColumns(mapping)'})
  columns!: any[];

  @property({type: Array, computed: '_getRows(mapping)'})
  rows!: any[];

  @property({type: Array, computed: '_getMiddleRows(mapping)'})
  middleRows!: any[];

  @property({type: Array, computed: '_determineOuterRows(columns, rows, data)'})
  outerRowsForDisplay!: any[];

  _getColumns(mapping: any[]) {
    return (mapping[0] || []).choices;
  }

  _getRows(mapping: any[]) {
    return (mapping[1] || []).choices;
  }

  _getMiddleRows(mapping: any[]) {
    return (mapping[2] || []).choices;
  }

  _determineOuterRows(columns: any[], rows: any[]) {
    return this._determineRows(this, rows, columns);
  }

  _determineMiddleRows(outerRowID: number, columns: any[], middleRows: any[], data: GenericObject) {
    if (!columns || !middleRows) {
      return [];
    }
    return middleRows.map((y) => {
      let formatted;

      const columnData = columns.map((z) => {
        formatted = this._formatDisaggregationIds([outerRowID, y.id, z.id]);

        return {
          key: formatted,
          data: data.disaggregation[formatted]
        };
      }, this);

      formatted = this._formatDisaggregationIds([outerRowID, y.id]);

      return {
        title: y.value,
        data: columnData,
        id: y.id,
        total: {
          key: formatted,
          data: data.disaggregation[formatted]
        }
      };
    }, this);
  }

  _determineTotals(columns: any[], middleRows: any[], data: GenericObject) {
    const columnData = columns.map((z) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted]
      };
    }, this);

    const columnTotalRow = {
      title: 'total',
      data: columnData,
      total: {
        key: '', // unused
        data: data.disaggregation['()']
      }
    };

    this.set('columnTotalRow', columnTotalRow);
    this.set('bottomRows', this._determineRows(this, middleRows, columns));
  }
}

window.customElements.define('three-disaggregations', ThreeDisaggregations);
