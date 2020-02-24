import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../../mixins/utils-mixin';
import '../etools-prp-number';
import './disaggregation-field';
import './disaggregation-table-cell';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../typings/globals.types';
import {fireEvent} from '../../utils/fire-custom-event';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCellPercentage extends UtilsMixin(PolymerElement){
  public static get template(){
    // language=HTML
    return html`
        ${disaggregationTableStyles}
      <style>
        :host {
          display: block;
  
          --app-grid-columns: 2;
          --app-grid-gutter: 0px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
        }
  
        .item,
        .computed-value {
          box-sizing: border-box;
          min-height: 25px;
          line-height: 25px;
        }
  
        .item {
          padding: 0;
          border-bottom: 1px solid white;
        }
  
        .item:not(:first-child) {
          border-left: 1px solid white;
        }
  
        .computed-value {
          @apply --app-grid-expandible-item;
  
          color: var(--theme-secondary-text-color);
        }
      </style>
      
      <disaggregation-table-cell data="[[data]]" editable="[[editable]]">
        <editable>
          <div class="app-grid">
            <div class="item">
              <disaggregation-field
                id="v"
                key="v"
                min="0"
                value="[[data.v]]"
                coords="[[coords]]">
              </disaggregation-field>
            </div>
            <div class="item">
              <disaggregation-field
                id="d"
                key="d"
                min="0"
                value="[[data.d]]"
                coords="[[coords]]"
                validator="[[vName]]">
              </disaggregation-field>
            </div>
            <div class="computed-value">[[_toPercentage(localData.c)]]</div>
          </div>
        </editable>
        <non-editable>
          <div class="app-grid">
            <div class="item">
              <etools-prp-number value="[[data.v]]"></etools-prp-number>
            </div>
            <div class="item">
              <etools-prp-number value="[[data.d]]"></etools-prp-number>
            </div>
            <div class="computed-value">[[_toPercentage(data.c)]]</div>
          </div>
        </non-editable>
      </disaggregation-table-cell>
    
    `;
  }

  @property({type: String})
  vName!: string;

  @property({type: Number})
  editable!: number;

  @property({type: Object})
  localData!: GenericObject;

  @property({type: Object, observer: '_cloneData'})
  data!: GenericObject;

  @property({type: String, observer: '_bindValidation'})
  coords!: string;


  _handleInput(e: CustomEvent) {

    let key = e.detail.key;
    let value = e.detail.value;
    let calculated;
    let change;

    if (e.detail.internal) {
      // Dont handle self-fired events.
      return;
    }

    e.stopPropagation();

    let v = this.shadowRoot!.querySelector('#v');
    let d = this.shadowRoot!.querySelector('#d');

    if (typeof value.v !== 'undefined') {
      d.validate();
    }

    change = Object.assign({}, this.get('localData'), value);

    if (v.invalid || d.invalid) {
      change.c = null;
    } else {
      calculated = change.v / change.d;

      if (calculated !== calculated) {
        calculated = 0;
      }

      change.c = calculated;

      fireEvent(this, 'field-value-changed', {
        key: key,
        value: change,
        internal: true,
      });
    }

    this.set('localData', change);
  }

  _bindValidation(coords: string) {
    let vName = 'v-' + coords;

    let validator = {
      validatorName: vName,
      validatorType: 'validator',
      validate: function (value: string) {
        return Number(value) !== 0 || Number(this.shadowRoot.querySelector('#v').getField().value) === 0;
      }.bind(this),
    };

    new Polymer.IronMeta({
      type: validator.validatorType,
      key: validator.validatorName,
      value: validator,
    });

    this.set('vName', vName);
  }

  _cloneData(data: GenericObject) {
    if (!this.localData) {
      this.set('localData', this._clone(data));
    }
  }

  _addEventListeners() {
    this._handleInput = this._handleInput.bind(this);
    this.addEventListener('field-value-changed', this._handleInput);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
    let nullData = this._clone(this.data);
    if (nullData !== undefined && nullData.v === 0) {
      nullData.v = null;
    }
    if (nullData !== undefined && nullData.d === 0) {
      nullData.d = null;
    }
    this.set('data', nullData);
  }

  _removeEventListeners() {
    this.removeEventListener('field-value-changed', this._handleInput);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

}

window.customElements.define('disaggregation-table-cell-percentage', DisaggregationTableCellPercentage);