import {PolymerElement, html} from '@polymer/polymer';
import {disaggregationTableStyles} from '../../../styles/disaggregation-table-styles';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../typings/globals.types';

// <link rel="import" href="../disaggregation-table-row.html">


/**
 * @polymer
 * @customElement
 */
class ZeroDisaggregations extends PolymerElement{
  public static get template(){
    // language=HTML
    return html`
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

  @property({type: Number})
  editable!: number;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Array, computed: '_determineTotalRow(mapping, data)'})
  totalRow!: any[];

  _determineTotalRow(_, data: GenericObject) {
    return {
      title: 'total',
      total: {
        key: '()',
        data: data.disaggregation['()'],
      },
    };
  }

}

window.customElements.define('zero-disaggregations', ZeroDisaggregations);
