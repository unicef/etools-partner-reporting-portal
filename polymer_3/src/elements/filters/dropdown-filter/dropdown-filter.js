var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import { fireEvent } from '../../../etools-prp-common/utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 * @appliesMixin LocalizeMixin
 */
class DropdownFilter extends LocalizeMixin(FilterMixin(ReduxConnectedElement)) {
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
        #field {
          width: 100%;
        }
      </style>

      <etools-dropdown
        id="field"
        label="[[label]]"
        options="[[data]]"
        option-value="id"
        option-label="title"
        selected="{{value}}"
        disabled="[[disabled]]"
        trigger-value-change-event
        on-etools-selected-item-changed="_handleFilterChange"
      >
      </etools-dropdown>
    `;
    }
    _handleFilterChange(e) {
        if (!e.detail.selectedItem) {
            return;
        }
        const newValue = e.detail.selectedItem.id;
        fireEvent(this, 'filter-changed', {
            name: this.name,
            value: String(newValue)
        });
    }
    _handleData(data) {
        if (data) {
            this._filterReady();
        }
    }
}
__decorate([
    property({ type: Boolean })
], DropdownFilter.prototype, "disabled", void 0);
__decorate([
    property({ type: String })
], DropdownFilter.prototype, "value", void 0);
__decorate([
    property({ type: Array, observer: '_handleData' })
], DropdownFilter.prototype, "data", void 0);
window.customElements.define('dropdown-filter', DropdownFilter);
