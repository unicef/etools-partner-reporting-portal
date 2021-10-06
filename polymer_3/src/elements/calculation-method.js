var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import LocalizeMixin from '../mixins/localize-mixin';
import UtilsMixin from '../mixins/utils-mixin';
/**
 * @polymer
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsBehavior
 */
class CalculationMethod extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
    constructor() {
        super(...arguments);
        this.disabled = false;
        this.readonly = false;
        this.choices = [
            {
                id: 'sum',
                title: 'Sum',
            },
            {
                id: 'max',
                title: 'Max',
            },
            {
                id: 'avg',
                title: 'Avg',
            },
        ];
        // TODO: Might also need validation at some point
    }
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }

        paper-radio-group {
          margin-left: -12px;
        }

        paper-radio-button,
        .read-only-label {
          text-transform: uppercase;
        }

        .read-only-label {
          display: inline-block;
          padding: 12px 0;
          line-height: 16px;
          color: var(--theme-secondary-text-color);
        }
      </style>

      <template
          is="dom-if"
          if="[[!readonly]]"
          restamp="true">
        <paper-radio-group
            selected="{{value}}">
          <template
              is="dom-repeat"
              items="[[choices]]">
            <paper-radio-button
                name="[[item.id]]"
                disabled="[[disabled]]">
              [[_localizeLowerCased(item.title, localize)]]
            </paper-radio-button>
          </template>
        </paper-radio-group>
      </template>

      <template
          is="dom-if"
          if="[[readonly]]"
          restamp="true">
        <span class="read-only-label">[[_localizeLowerCased(readOnlyLabel, localize)]]</span>
      </template>
    `;
    }
    _computeReadonlyLabel(value, choices) {
        const method = choices.find(function (choice) {
            return choice.id === value;
        });
        return method ? method.title : 'Invalid method';
    }
}
__decorate([
    property({ type: Boolean })
], CalculationMethod.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], CalculationMethod.prototype, "readonly", void 0);
__decorate([
    property({ type: String, notify: true })
], CalculationMethod.prototype, "value", void 0);
__decorate([
    property({ type: Array })
], CalculationMethod.prototype, "choices", void 0);
__decorate([
    property({ type: String, computed: '_computeReadonlyLabel(value, choices)' })
], CalculationMethod.prototype, "readOnlyLabel", void 0);
window.customElements.define('calculation-method', CalculationMethod);
export { CalculationMethod as CalculationMethodEl };
