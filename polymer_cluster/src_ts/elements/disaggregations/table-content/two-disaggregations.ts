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
class TwoDisaggregations extends UtilsMixin(DisaggregationMixin(PolymerElement)) {
  public static get template() {
    // language=HTML
    return html`
      ${disaggregationTableStyles}
      <style></style>

      <tr class="horizontal layout headerRow">
        <th></th>

        <template is="dom-repeat" items="[[columns]]" as="column">
          <th>[[_capitalizeFirstLetter(column.value)]]</th>
        </template>

        <th>Total</th>
      </tr>

      <template is="dom-repeat" items="[[rowsForDisplay]]" as="row">
        <disaggregation-table-row
          data="[[row]]"
          level-reported="[[data.level_reported]]"
          indicator-type="[[data.display_type]]"
          row-type="middleRow"
          editable="[[editable]]"
        >
        </disaggregation-table-row>
      </template>

      <disaggregation-table-row
        data="[[totalsForDisplay]]"
        level-reported="[[data.level_reported]]"
        indicator-type="[[data.display_type]]"
        row-type="totalsRow"
      >
      </disaggregation-table-row>
    `;
  }

  @property({type: Number})
  editable!: number;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Array})
  mapping!: any[];

  @property({type: Array, computed: '_getColumns(mapping)'})
  columns!: any[];

  @property({type: Array, computed: '_getRows(mapping)'})
  rows!: any[];

  @property({type: Object, computed: '_determineTotals(columns, data)'})
  totalsForDisplay!: GenericObject;

  @property({type: Object, computed: '_determineRowsForDisplay(columns, rows, data)'})
  rowsForDisplay!: GenericObject;

  _getColumns(mapping: any[]) {
    return (mapping[0] || []).choices;
  }

  _getRows(mapping: any[]) {
    return (mapping[1] || []).choices;
  }

  _determineRowsForDisplay(columns: any[], rows: any[]) {
    return this._determineRows(this, rows, columns);
  }

  _determineTotals(columns: any[], data: GenericObject) {
    const columnData = columns.map((z) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted]
      };
    }, this);

    return {
      title: 'total',
      data: columnData,
      total: {
        key: '', // unused,
        data: data.disaggregation['()']
      }
    };
  }
}

window.customElements.define('two-disaggregations', TwoDisaggregations);
