var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-button/paper-button';
import ChipMixin from '../../mixins/chip-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import { buttonsStyles } from '../../styles/buttons-styles';
import { fireEvent } from '../../utils/fire-custom-event';
/**
* @polymer
* @customElement
* @appliesMixin ChipMixin
* @appliesMixin LocalizeMixin
*/
class ChipDisaggValue extends ChipMixin(LocalizeMixin(ReduxConnectedElement)) {
    static get template() {
        // language=HTML
        return html `
    ${buttonsStyles}
    <style include="iron-flex iron-flex-alignment">
      :host {
        display: block;

        --paper-dialog: {
          width: 175px;
          max-width: none !important;
          padding: 10px;
          margin: 0;
        }

        --paper-input-container: {
          padding: 0;
        };
      }

      .add-chip {
        text-decoration: none;
        color: var(--theme-primary-color);
      }

      .row:not(:last-child) {
        margin-bottom: .5em;
      }

      paper-input {
        width: 100%;
      }

      paper-button {
        margin: 0;
      }
    </style>

    <a
        id="add"
        class="add-chip"
        on-tap="_open"
        href="#">
      &plus; [[localize('add')]]
    </a>

    <paper-dialog
        id="dialog"
        opened="{{_adding}}"
        horizontal-align="left"
        vertical-align="top">
      <div class="row layout horizontal">
        <paper-input
            id="field"
            value="{{_value}}"
            on-keyup="_handleKeyup"
            maxlength="128"
            no-label-float
            required
            autofocus>
        </paper-input>
      </div>
      <div class="row layout horizontal justified">
        <paper-button
            on-tap="_add"
            class="btn-primary">
          [[localize('add')]]
        </paper-button>

        <paper-button
            on-tap="_close">
          [[localize('cancel')]]
        </paper-button>
      </div>
    </paper-dialog>
  `;
    }
    _setDefaults(adding) {
        if (!adding) {
            return;
        }
        this.set('_value', '');
    }
    _add() {
        this.$.field.validate();
        if (this.$.field.invalid) {
            return;
        }
        if (!this._formattedValue.length) {
            this.$.field.invalid = true;
            return;
        }
        fireEvent(this, 'chip-add', this._formattedValue);
        this._close();
    }
    _computeFormattedValue(value) {
        return value.trim();
    }
    _handleKeyup(e) {
        const key = e.which;
        if (key === 13) {
            this._add();
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.$.dialog.positionTarget = this.$.add;
    }
}
__decorate([
    property({ type: String })
], ChipDisaggValue.prototype, "_value", void 0);
__decorate([
    property({ type: String, computed: '_computeFormattedValue(_value)' })
], ChipDisaggValue.prototype, "_formattedValue", void 0);
window.customElements.define('chip-disagg-value', ChipDisaggValue);
