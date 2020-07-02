import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import UtilsMixin from '../../mixins/utils-mixin';
import './disaggregation-table-cell';
import './disaggregation-field';
import '../etools-prp-number';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {GenericObject} from '../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCellNumber extends UtilsMixin(PolymerElement) {
  public static get template() {
    return html`
      ${disaggregationTableStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      <disaggregation-table-cell data="[[data]]" editable="[[editable]]">
        <template is="dom-if" if="[[editable]]" restamp>
          <disaggregation-field slot="editable" key="v" value="[[data.v]]" coords="[[coords]]"> </disaggregation-field>
        </template>
        <template is="dom-if" if="[[!editable]]" restamp>
          <etools-prp-number slot="non-editable" value="[[data.v]]"></etools-prp-number>
        </template>
      </disaggregation-table-cell>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  coords!: string;

  @property({type: Number})
  editable!: number;

  connectedCallback() {
    super.connectedCallback();
    const nullData = this._clone(this.data);
    if (nullData !== undefined && nullData.v === 0) {
      nullData.v = null;
    }
    if (nullData !== undefined && nullData.d === 0) {
      nullData.d = null;
    }
    this.set('data', nullData);
  }
}

window.customElements.define('disaggregation-table-cell-number', DisaggregationTableCellNumber);
