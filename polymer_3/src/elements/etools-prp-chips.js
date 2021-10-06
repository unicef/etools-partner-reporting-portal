var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import './labelled-item';
import { property } from '@polymer/decorators/lib/decorators';
import { fireEvent } from '../utils/fire-custom-event';
import { sharedStyles } from '../styles/shared-styles';
import Settings from '../settings';
/**
 * @polymer
 * @customElement
 */
class EtoolsPrpChips extends PolymerElement {
    constructor() {
        super(...arguments);
        this.value = [];
        this.required = false;
        this.disabled = false;
        this.invalid = true;
    }
    static get template() {
        return html `
      ${sharedStyles}
      <style include="iron-flex">
        :host {
          display: block;
          padding: 8px 0;
        }

        .chips {
          font-size: 16px;
          line-height: 24px;
        }

        .chip {
          max-width: 100%;
          margin-right: .75em;
        }

        .chip__content {
          @apply --truncate;
        }

        .chip__content--disabled {
          color: var(--theme-primary-text-color-medium);
        }

        .chip__actions iron-icon {
          width: 18px;
          height: 18px;
          margin-left: 2px;
          position: relative;
          top: -2px;
          color: var(--paper-deep-orange-a700);
          cursor: pointer;
        }
      </style>

      <labelled-item label="[[label]]" invalid="[[_invalid]]">
        <div class="chips layout horizontal wrap">
          <template
              is="dom-repeat"
              items="[[value]]"
              as="chip">
            <div class="chip layout horizontal">
              <div class$="[[_chipContentClass]]">[[chip]]</div>

              <template
                  is="dom-if"
                  if="[[!disabled]]"
                  restamp="true">
                <div class="chip__actions">
                  <iron-icon
                      data-index$="[[index]]"
                      on-tap="_onChipRemove"
                      icon="icons:clear">
                  </iron-icon>
                </div>
              </template>
            </div>
          </template>

          <slot></slot>
        </div>
      </labelled-item>

    `;
    }
    static get observers() {
        return [
            '_sortDateValues(value, value.length)'
        ];
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    validate() {
        this.set('_invalid', this.invalid);
    }
    _computeInvalid(required, value) {
        return required && !value.length;
    }
    _sortDateValues() {
        this.value.sort((a, b) => {
            return moment(a, Settings.dateFormat) - moment(b, Settings.dateFormat);
        });
    }
    _computeChipContentClass(disabled) {
        return 'chip__content' + (disabled ? ' chip__content--disabled' : '');
    }
    _onChipAdd(e) {
        e.stopPropagation();
        if (this.value.indexOf(e.detail) === -1) {
            this.set('value', this.value.concat(e.detail));
            fireEvent(this, 'selected-chips-updated');
        }
    }
    _onChipRemove(e) {
        let value = this.value.slice();
        let toRemove = +e.target.dataset.index;
        value.splice(toRemove, 1);
        this.set('value', value);
        fireEvent(this, 'selected-chips-updated');
    }
    _addEventListeners() {
        this.addEventListener('chip-add', this._onChipAdd);
    }
    _removeEventListeners() {
        this.removeEventListener('chip-add', this._onChipAdd);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
        this.set('value', []);
    }
}
__decorate([
    property({ type: String })
], EtoolsPrpChips.prototype, "label", void 0);
__decorate([
    property({ type: String })
], EtoolsPrpChips.prototype, "name", void 0);
__decorate([
    property({ type: Array, notify: true })
], EtoolsPrpChips.prototype, "value", void 0);
__decorate([
    property({ type: Boolean })
], EtoolsPrpChips.prototype, "required", void 0);
__decorate([
    property({ type: Boolean })
], EtoolsPrpChips.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, notify: true, computed: '_computeInvalid(required, value)' })
], EtoolsPrpChips.prototype, "invalid", void 0);
window.customElements.define('etools-prp-chips', EtoolsPrpChips);
