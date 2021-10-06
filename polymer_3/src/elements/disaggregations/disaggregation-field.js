var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/paper-input/paper-input';
import DisaggregationFieldMixin from '../../mixins/disaggregation-field-mixin';
import { fireEvent } from '../../utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationFieldMixin
 */
class DisaggregationField extends DisaggregationFieldMixin(ReduxConnectedElement) {
    static get template() {
        // language=HTML
        return html `
     <style>
      :host {
        display: block;

        --paper-input-container: {
          padding: 0;
        };

        --paper-input-container-input: {
          font-size: 13px;
        };

        --paper-input-container-input-webkit-spinner: {
          display: none;
        };
      }
    </style>

    <paper-input
        id="field"
        value="[[value]]"
        allowed-pattern="^\\d*\\.?\\d*$"
        invalid="{{invalid}}"
        validator="[[validator]]"
        min="[[min]]"
        on-value-changed="_inputValueChanged"
        no-label-float
        required>
    </paper-input>
    `;
    }
    connectedCallback() {
        super.connectedCallback();
        this.$.field.validate();
        fireEvent(this, 'register-field', this);
    }
    validate() {
        return this.$.field.validate();
    }
    getField() {
        return this.$.field;
    }
    _inputValueChanged(e) {
        const change = {};
        change[this.key] = e.target.value;
        fireEvent(this, 'field-value-changed', {
            key: this.coords,
            value: this._toNumericValues(change)
        });
    }
}
__decorate([
    property({ type: String })
], DisaggregationField.prototype, "key", void 0);
__decorate([
    property({ type: String })
], DisaggregationField.prototype, "coords", void 0);
__decorate([
    property({ type: String })
], DisaggregationField.prototype, "validator", void 0);
__decorate([
    property({ type: Number })
], DisaggregationField.prototype, "min", void 0);
__decorate([
    property({ type: Number, notify: true })
], DisaggregationField.prototype, "value", void 0);
__decorate([
    property({ type: Boolean, notify: true })
], DisaggregationField.prototype, "invalid", void 0);
window.customElements.define('disaggregation-field', DisaggregationField);
export { DisaggregationField as DisaggregationFieldEl };
