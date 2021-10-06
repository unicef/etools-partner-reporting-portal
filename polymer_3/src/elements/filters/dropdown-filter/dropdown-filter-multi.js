var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import { fireEvent } from '../../../etools-prp-common/utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 */
class DropdownFilterMulti extends FilterMixin(PolymerElement) {
    constructor() {
        super(...arguments);
        this.selectedValues = [];
    }
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }

        etools-dropdown-multi {
          width: 100%;
        }
      </style>

      <etools-dropdown-multi
        label="[[label]]"
        options="[[data]]"
        option-value="id"
        option-label="title"
        selected-values="{{selectedValues}}"
        trigger-value-change-event
        on-etools-selected-items-changed="_handleChange"
        hide-search="[[hideSearch]]"
        disabled="[[disabled]]"
      >
      </etools-dropdown-multi>
    `;
    }
    static get observers() {
        return ['_setSelectedValues(value, data)'];
    }
    _handleChange(e) {
        if (e.detail.selectedItems && this.data) {
            const newValue = e.detail.selectedItems.map((item) => item['id']).join(',');
            if (newValue !== this.value) {
                fireEvent(this, 'filter-changed', {
                    name: this.name,
                    value: String(newValue || '')
                });
            }
        }
    }
    _handleData(data) {
        if (data) {
            this._filterReady();
        }
        else if (this.name === 'location' || this.name === 'locs') {
            // Locations get populated by PDs so user can filter by location, so if there are no PDs,
            // there are no locations - in that case, fire filterReady method to have filters stop loading.
            this._filterReady();
        }
    }
    _setSelectedValues(value) {
        if (typeof value === 'string' && value !== this.selectedValues.join(',')) {
            this.set('selectedValues', value.split(',').filter(Boolean));
        }
    }
}
__decorate([
    property({ type: String })
], DropdownFilterMulti.prototype, "value", void 0);
__decorate([
    property({ type: Boolean })
], DropdownFilterMulti.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], DropdownFilterMulti.prototype, "hideSearch", void 0);
__decorate([
    property({ type: Array, observer: '_handleData' })
], DropdownFilterMulti.prototype, "data", void 0);
__decorate([
    property({ type: Array })
], DropdownFilterMulti.prototype, "selectedValues", void 0);
window.customElements.define('dropdown-filter-multi', DropdownFilterMulti);
