var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import { sharedStyles } from '../styles/shared-styles';
/**
 * @polymer
 * @customElement
 */
class LabelledItem extends PolymerElement {
    constructor() {
        super(...arguments);
        this.invalid = false;
    }
    static get template() {
        return html `
        ${sharedStyles}
      <style>
        :host {
            display: block;
            position: relative;
        }

        .labelled-item {
            margin: 0;
        }

        .labelled-item__label {
            font-size: 12px;
            color: #737373;

            @apply --labelled-item-label;
            @apply --truncate;
        }

        .labelled-item__content {
            margin: 0;
        }

        .error {
            color: var(--paper-deep-orange-a700);
        }

        ::slotted(.field-value) {
            font-size: 16px;
        }
      </style>

      <dl class="labelled-item">
        <dt class$="labelled-item__label [[labelClassName]]">[[label]]</dt>
        <dd class="labelled-item__content">
          <slot></slot>
        </dd>
      </dl>
      `;
    }
    _computeLabelClassName(invalid) {
        return invalid ? 'error' : '';
    }
}
__decorate([
    property({ type: String })
], LabelledItem.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], LabelledItem.prototype, "invalid", void 0);
__decorate([
    property({ type: String, computed: '_computeLabelClassName(invalid)' })
], LabelledItem.prototype, "labelClassName", void 0);
window.customElements.define('labelled-item', LabelledItem);
