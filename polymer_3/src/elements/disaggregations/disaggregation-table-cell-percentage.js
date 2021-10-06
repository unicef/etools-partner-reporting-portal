var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../../mixins/utils-mixin';
import '../etools-prp-number';
import './disaggregation-field';
import './disaggregation-table-cell';
import { disaggregationTableStyles } from '../../styles/disaggregation-table-styles';
import { fireEvent } from '../../utils/fire-custom-event';
import '@polymer/iron-meta/iron-meta';
import { IronMeta } from '@polymer/iron-meta/iron-meta';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCellPercentage extends UtilsMixin(PolymerElement) {
    static get template() {
        // language=HTML
        return html `
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
            <div class="computed-value">[[_toPercentage(localData.c)]]</div>
          </div>
          <div slot="non-editable" class="app-grid">
            <div class="item">
              <etools-prp-number value="[[data.v]]"></etools-prp-number>
            </div>
            <div class="item">
              <etools-prp-number value="[[data.d]]"></etools-prp-number>
            </div>
            <div class="computed-value">[[_toPercentage(data.c)]]</div>
          </div>
      </disaggregation-table-cell>

    `;
    }
    _handleInput(e) {
        const key = e.detail.key;
        const value = e.detail.value;
        if (e.detail.internal) {
            // Dont handle self-fired events.
            return;
        }
        e.stopPropagation();
        const v = this.shadowRoot.querySelector('#v');
        const d = this.shadowRoot.querySelector('#d');
        const change = Object.assign({}, this.get('localData'), value);
        if (!d.validate() || !v.validate()) {
            change.c = null;
        }
        else {
            change.c = change.d === 0 ? 0 : change.v / change.d;
            fireEvent(this, 'field-value-changed', {
                key: key,
                value: change,
                internal: true
            });
        }
        this.set('localData', change);
    }
    _bindValidation(coords) {
        const vName = 'v-' + coords;
        const self = this;
        const validator = {
            validatorName: vName,
            validatorType: 'validator',
            validate: function (value) {
                return Number(value) !== 0 ||
                    Number(self.shadowRoot.querySelector('#v').getField().value) === 0;
            }.bind(self)
        };
        new IronMeta({
            type: validator.validatorType,
            key: validator.validatorName,
            value: validator
        });
        this.set('vName', vName);
    }
    _cloneData(data) {
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
        this.removeEventListener('field-value-changed', this._handleInput);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: String })
], DisaggregationTableCellPercentage.prototype, "vName", void 0);
__decorate([
    property({ type: Number })
], DisaggregationTableCellPercentage.prototype, "editable", void 0);
__decorate([
    property({ type: Object })
], DisaggregationTableCellPercentage.prototype, "localData", void 0);
__decorate([
    property({ type: Object, observer: '_cloneData' })
], DisaggregationTableCellPercentage.prototype, "data", void 0);
__decorate([
    property({ type: String, observer: '_bindValidation' })
], DisaggregationTableCellPercentage.prototype, "coords", void 0);
window.customElements.define('disaggregation-table-cell-percentage', DisaggregationTableCellPercentage);
