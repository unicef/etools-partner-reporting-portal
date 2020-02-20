import {html, PolymerElement} from '@polymer/polymer';
import UtilsMixin from '../../mixins/utils-mixin';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import '@polymer/polymer/lib/elements/dom-if';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCell extends UtilsMixin(PolymerElement){
  public static get template(){
    return html`
        ${disaggregationTableStyles}
      <style>
        :host {
          display: block;
        }
      </style>
      
      <template
        is="dom-if"
        if="[[editableBool]]">
        <slot select="editable"></slot>
      </template>
      
      <template
        is="dom-if"
        if="[[!editableBool]]">
        <span class="cellValue">
          <template
            is="dom-if"
            if="[[noValue]]"
            restamp="true">
            0
          </template>
          <template
            is="dom-if"
            if="[[!noValue]]"
            restamp="true">
            <slot select="non-editable"></slot>
          </template>
        </span>
      </template>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Number})
  editable!: number;

  @property({type: Boolean, computed: '_computeEditableBool(editable)'})
  editableBool!: boolean;

  @property({type: Boolean, computed: '_computeNoValue(data)'})
  noValue!: boolean;

  _computeEditableBool(editable: number) {
    return editable === 1;
  }

  _computeNoValue(data: GenericObject) {
    return data ? !data.c && !data.d && !data.v : true;
  }

}

window.customElements.define('disaggregation-table-cell', DisaggregationTableCell);
