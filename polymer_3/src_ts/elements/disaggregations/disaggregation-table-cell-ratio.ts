import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../../mixins/utils-mixin';
import '../etools-prp-number';
import './disaggregation-field';
import './disaggregation-table-cell';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {GenericObject} from '../../typings/globals.types';
import {fireEvent} from '../../utils/fire-custom-event';
import '@polymer/iron-meta/iron-meta';
import {IronMeta} from '@polymer/iron-meta/iron-meta';
import {DisaggregationFieldEl} from "./disaggregation-field";

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCellRatio extends UtilsMixin(PolymerElement) {
  public static get template() {
    // language=HTML
    return html`
        ${disaggregationTableStyles}
      <style include="app-grid-style">

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
          <div slot="editable" class="app-grid">
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
            <div class="computed-value">
              <etools-prp-number value="[[localData.v]]"></etools-prp-number>
              /
              <etools-prp-number value="[[localData.d]]"></etools-prp-number>
            </div>
          </div>
          <div slot="non-editable" class="app-grid">
            <div class="item">
              <etools-prp-number value="[[data.v]]"></etools-prp-number>
            </div>
            <div class="item">
              <etools-prp-number value="[[data.d]]"></etools-prp-number>
            </div>
            <div class="computed-value">
              <etools-prp-number value="[[data.v]]"></etools-prp-number>
              /
              <etools-prp-number value="[[data.d]]"></etools-prp-number>
            </div>
          </div>
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
    const key = e.detail.key;
    const value = e.detail.value;
    let calculated;

    if (e.detail.internal) {
      // Dont handle self-fired events.
      return;
    }

    e.stopPropagation();

    const v = (this.shadowRoot!.querySelector('#v') as DisaggregationFieldEl);
    const d = (this.shadowRoot!.querySelector('#d') as DisaggregationFieldEl);

    if (typeof value.v !== 'undefined') {
      d.validate();
    }

    if (typeof value.d !== 'undefined') {
      v.validate();
    }

    const change = Object.assign({}, this.get('localData'), value);

    if ((v as any).invalid || (d as any).invalid) {
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
        internal: true
      });
    }

    ['v', 'd'].forEach(function(key) {
      if (isNaN(change[key])) {
        delete change[key];
      }
    });

    this.set('localData', change);
  }

  _bindValidation(coords: string) {
    const vName = 'v-' + coords;
    const self = this;
    let validator = {
      validatorName: vName,
      validatorType: 'validator',
      validate: function(value: string) {
        return Number(value) !== 0 || Number(self!.shadowRoot!.querySelector('#v')!.getField().value) === 0;
      }.bind(self)
    };

    new IronMeta({
      type: validator.validatorType,
      key: validator.validatorName,
      value: validator
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
    this.addEventListener('field-value-changed', this._handleInput as any);
  }

  connectedCallback() {
    super.connectedCallback();

    this._addEventListeners();
    const nullData = this._clone(this.data);
    if (nullData !== undefined && nullData.v === 0) {
      nullData.v = null;
    }
    if (nullData !== undefined && nullData.d === 0) {
      nullData.d = null;
    }
    this.set('data', nullData);
  }

  _removeEventListeners() {
    this.removeEventListener('field-value-changed', this._handleInput as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._removeEventListeners();
  }

}

window.customElements.define('disaggregation-table-cell-ratio', DisaggregationTableCellRatio);
