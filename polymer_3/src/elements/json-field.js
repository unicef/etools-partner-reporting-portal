var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import './labelled-item';
import UtilsMixin from '../mixins/utils-mixin';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class JsonField extends UtilsMixin(PolymerElement) {
    constructor() {
        super(...arguments);
        this.disableDenominator = false;
        this.required = false;
        this.disabled = false;
        this.hideLabel = false;
        this.isRatio = false;
        this.invalid = false;
    }
    static get template() {
        return html `
    <style include="app-grid-style">
      :host {
        display: block;

        --app-grid-columns: 2;
        --app-grid-gutter: 16px;
        --app-grid-item-height: auto;

        --labelled-item-label: {
          position: relative;
          top: 1px;

          @apply --json-field-label;
        };
      }

      .app-grid {
        margin: -var(--app-grid-gutter);
        position: relative;
      }

      .app-grid::before {
        content: "/";
        position: absolute;
        left: 50%;
        top: 27px;
        color: var(--theme-secondary-text-color);
        transform: translateX(-50%);
      }

      labelled-item {
        padding-top: 8px;
      }

      paper-input.item {
        margin-top: -8px;
      }
    </style>

    <template
        is="dom-if"
        if="[[!isRatio]]"
        restamp="true">
      <paper-input
          class="validate"
          label="[[label]]"
          value="[[value.v]]"
          on-input="_onInput"
          data-field="v"
          type="number"
          allowed-pattern="[[allowedPattern]]"
          required="[[required]]"
          disabled="[[disabled]]"
          no-label-float="[[hideLabel]]"
          always-float-label="[[!hideLabel]]">
      </paper-input>
    </template>

    <template
        is="dom-if"
        if="[[isRatio]]"
        restamp="true">
      <labelled-item label="[[label]]">
        <div class="app-grid">
          <paper-input
              class="item validate"
              value="[[value.v]]"
              on-input="_onInput"
              data-field="v"
              type="number"
              allowed-pattern="[[allowedPattern]]"
              required="[[_computeRequired(required, value, 'd')]]"
              disabled="[[disabled]]"
              placeholder="Numerator"
              no-label-float>
          </paper-input>

          <paper-input
              class="item validate"
              value="[[value.d]]"
              on-input="_onInput"
              data-field="d"
              type="number"
              allowed-pattern="[[allowedPattern]]"
              required="[[_computeRequired(required, value, 'v')]]"
              disabled="[[_computeDisabled(disabled, disableDenominator)]]"
              placeholder="Denominator"
              no-label-float>
          </paper-input>
        </div>
      </labelled-item>
    </template>
  `;
    }
    _computeDisabled(disabled, disableDenominator) {
        return disabled || disableDenominator;
    }
    validate() {
        this._fieldsAreValid();
    }
    _onInput(e) {
        const change = {};
        change[e.target.dataset.field] = e.target.value;
        this.set('value', Object.assign({}, this.get('value'), change));
    }
    _computeIsRatio(type) {
        return type === 'ratio';
    }
    _computeInvalid(required, isRatio, value) {
        if (!value) {
            return true;
        }
        if (required) {
            if (isRatio) {
                return typeof value.v === 'undefined' || typeof value.d === 'undefined';
            }
            else {
                return typeof value.v === 'undefined';
            }
        }
        else {
            if (isRatio) {
                return typeof value.v !== 'undefined' ?
                    typeof value.d === 'undefined' :
                    typeof value.d !== 'undefined'; // xor
            }
            else {
                return false;
            }
        }
    }
    _resetDenominator(isRatio) {
        if (isRatio) {
            return;
        }
        const newValue = Object.assign({}, this.get('value'));
        delete newValue.d;
        this.set('value', newValue);
    }
    _computeRequired(required, value, key) {
        // May not be required yet still we need a valid value.
        return required || (value ? !!value[key] : false);
    }
    _onValueChanged(e) {
        e.stopPropagation();
    }
    _addEventListeners() {
        this._onValueChanged = this._onValueChanged.bind(this);
        this.addEventListener('value-changed', this._onValueChanged);
    }
    _removeEventListeners() {
        this.removeEventListener('value-changed', this._onValueChanged);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: String })
], JsonField.prototype, "allowedPattern", void 0);
__decorate([
    property({ type: String })
], JsonField.prototype, "label", void 0);
__decorate([
    property({ type: String })
], JsonField.prototype, "type", void 0);
__decorate([
    property({ type: Boolean })
], JsonField.prototype, "disableDenominator", void 0);
__decorate([
    property({ type: Boolean })
], JsonField.prototype, "required", void 0);
__decorate([
    property({ type: Boolean })
], JsonField.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], JsonField.prototype, "hideLabel", void 0);
__decorate([
    property({ type: Object, notify: true })
], JsonField.prototype, "value", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeIsRatio(type)', observer: '_resetDenominator' })
], JsonField.prototype, "isRatio", void 0);
__decorate([
    property({ type: Boolean, notify: true, computed: '_computeInvalid(required, isRatio, value)' })
], JsonField.prototype, "invalid", void 0);
window.customElements.define('json-field', JsonField);
export { JsonField as JsonFieldEl };
