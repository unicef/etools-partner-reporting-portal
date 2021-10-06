var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-checkbox/paper-checkbox';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { property } from '@polymer/decorators';
import { fireEvent } from '../../../etools-prp-common/utils/fire-custom-event';
import { timeOut } from '@polymer/polymer/lib/utils/async';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin FilterMixin
 */
class CheckboxFilter extends UtilsMixin(FilterMixin(PolymerElement)) {
    constructor() {
        super(...arguments);
        this.value = '';
    }
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }

        ::slotted() .checkbox-label {
          font-size: 12px;
        }
      </style>

      <paper-checkbox id="field" name="[[name]]" checked="{{checked}}" on-tap="_handleInput">
        <slot></slot>
      </paper-checkbox>
    `;
    }
    _handleInput() {
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
            const newValue = this.$.field.checked;
            if (newValue.toString() !== this.lastValue) {
                fireEvent(this, 'filter-changed', {
                    name: this.name,
                    value: newValue.toString()
                });
            }
        });
    }
    _computeChecked(value) {
        return value ? !!this._toNumber(value) : false;
    }
    connectedCallback() {
        super.connectedCallback();
        this._filterReady();
    }
    disconnectedCallback() {
        super.connectedCallback();
        if (this._debouncer && this._debouncer.isActive()) {
            this._debouncer.cancel();
        }
    }
}
__decorate([
    property({ type: Boolean, notify: true, computed: '_computeChecked(value)' })
], CheckboxFilter.prototype, "checked", void 0);
__decorate([
    property({ type: String })
], CheckboxFilter.prototype, "value", void 0);
window.customElements.define('checkbox-filter', CheckboxFilter);
export { CheckboxFilter as CheckboxFilterEl };
