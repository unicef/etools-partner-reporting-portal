import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-repeat';
import UtilsMixin from '../../../mixins/utils-mixin';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
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
class OneDisaggregation extends DisaggregationMixin(UtilsMixin(PolymerElement)) {
  public static get template() {
    // language=HTML
    return html`
      ${disaggregationTableStyles}
      <style></style>

      <tr class="horizontal layout headerRow">
        <th></th>
        <th>Total</th>
      </tr>

      <template is="dom-repeat" items="[[rows]]" as="row">
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
        data="[[totalRow]]"
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

  @property({type: Array, computed: '_determineTotalRow(data)'})
  totalRow!: any[];

  @property({type: Array, computed: '_getColumns(mapping)'})
  columns!: any[];

  @property({type: Array, computed: '_determineRows(columns, data)'})
  rows!: any[];

  _getColumns(mapping: any[]) {
    return (mapping[0] || []).choices;
  }

  _determineTotalRow(data: GenericObject) {
    return {
      title: 'total',
      total: {
        key: '', // unused
        data: data.disaggregation['()']
      }
    };
  }

  _determineRows(columns: any[], data: GenericObject) {
    return columns.map((z) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        title: z.value,
        data: [
          {
            key: formatted,
            data: data.disaggregation[formatted]
          }
        ]
      };
    }, this);
  }
}

window.customElements.define('one-disaggregation', OneDisaggregation);
