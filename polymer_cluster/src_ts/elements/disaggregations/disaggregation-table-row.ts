import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@unicef-polymer/etools-data-table/etools-data-table';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';
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
  public static get template() {
    return html`
      ${disaggregationTableStyles}
      <style></style>

      <tr class$="[[_computeClass(rowType)]]">
        <td class="cellTitle">
          <span class="cellValue">[[_capitalizeFirstLetter(data.title)]]</span>
        </td>

        <template is="dom-repeat" items="[[data.data]]">
          <td>
            <template is="dom-if" if="[[_equals(indicatorType, 'number')]]" restamp="true">
              <disaggregation-table-cell-number coords="[[item.key]]" data="[[item.data]]" editable="[[editable]]">
              </disaggregation-table-cell-number>
            </template>

            <template is="dom-if" if="[[_equals(indicatorType, 'percentage')]]" restamp="true">
              <disaggregation-table-cell-percentage coords="[[item.key]]" data="[[item.data]]" editable="[[editable]]">
              </disaggregation-table-cell-percentage>
            </template>
            <template is="dom-if" if="[[_equals(indicatorType, 'ratio')]]" restamp="true">
              <disaggregation-table-cell-ratio coords="[[item.key]]" data="[[item.data]]" editable="[[editable]]">
              </disaggregation-table-cell-ratio>
            </template>
          </td>
        </template>

        <template is="dom-if" if="[[data.total]]">
          <td class="cellTotal">
            <template is="dom-if" if="[[_equals(indicatorType, 'number')]]" restamp="true">
              <disaggregation-table-cell-number
                coords="[[data.total.key]]"
                data="[[data.total.data]]"
                editable="[[totalEditable]]"
              >
              </disaggregation-table-cell-number>
            </template>

            <template is="dom-if" if="[[_equals(indicatorType, 'percentage')]]" restamp="true">
              <disaggregation-table-cell-percentage
                coords="[[data.total.key]]"
                data="[[data.total.data]]"
                editable="[[totalEditable]]"
              >
              </disaggregation-table-cell-percentage>
            </template>
            <template is="dom-if" if="[[_equals(indicatorType, 'ratio')]]" restamp="true">
              <disaggregation-table-cell-ratio
                coords="[[data.total.key]]"
                data="[[data.total.data]]"
                editable="[[totalEditable]]"
              >
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

  @property({type: Object})
  data!: GenericObject;

  @property({type: Number})
  levelReported!: number;

  @property({type: String})
  indicatorType!: string;

  @property({type: String})
  rowType!: string;

  @property({type: Number})
  editable = 0;

  @property({type: Number})
  totalEditable = 0;

  _computeClass(rowType: string) {
    return rowType;
  }

  _setTotalEditable(coords: string, levelReported: number, editable: number) {
    this.set('totalEditable', coords === '()' && levelReported === 0 ? editable : 0);
  }
}

window.customElements.define('disaggregation-table-row', DisaggregationTableRow);
