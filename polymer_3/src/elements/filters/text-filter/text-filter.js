var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import '@polymer/paper-input/paper-input';
import { property } from '@polymer/decorators';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { fireEvent } from '../../../etools-prp-common/utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 */
class TextFilter extends FilterMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.type = 'text';
    }
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <paper-input
        id="field"
        type="[[type]]"
        label="[[label]]"
        value="[[value]]"
        on-value-changed="_filterValueChanged"
        always-float-label
      >
      </paper-input>
    `;
    }
    _filterValueChanged() {
        this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(250), () => {
            if (this.$.field.value) {
                const newValue = this.$.field.value.trim();
                if (newValue !== this.lastValue) {
                    fireEvent(this, 'filter-changed', {
                        name: this.name,
                        value: newValue
                    });
                }
            }
        });
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
    property({ type: String })
], TextFilter.prototype, "properties", void 0);
__decorate([
    property({ type: String })
], TextFilter.prototype, "type", void 0);
window.customElements.define('text-filter', TextFilter);
