var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import { fireEvent } from '../../../etools-prp-common/utils/fire-custom-event';
/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 */
class SearchableDropdownFilter extends FilterMixin(PolymerElement) {
    constructor() {
        super(...arguments);
        this.value = '';
        this.data = [];
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
        selected="[[value]]"
        disabled="[[disabled]]"
        selected-item="{{selectedItem}}"
        trigger-value-change-event
        on-etools-selected-item-changed="_handleDropdownChange"
      >
      </etools-dropdown>
    `;
    }
    _handleDropdownChange(event) {
        if (event.detail.selectedItem) {
            setTimeout(() => {
                fireEvent(this, 'filter-changed', {
                    name: this.name,
                    value: String(event.detail.selectedItem.id)
                });
            });
        }
    }
    _handleData(data) {
        if (data.length) {
            this._filterReady();
        }
    }
}
__decorate([
    property({ type: Object })
], SearchableDropdownFilter.prototype, "selectedItem", void 0);
__decorate([
    property({ type: Boolean })
], SearchableDropdownFilter.prototype, "disabled", void 0);
__decorate([
    property({ type: String })
], SearchableDropdownFilter.prototype, "value", void 0);
__decorate([
    property({ type: String })
], SearchableDropdownFilter.prototype, "name", void 0);
__decorate([
    property({ type: String })
], SearchableDropdownFilter.prototype, "label", void 0);
__decorate([
    property({ type: Array, observer: '_handleData' })
], SearchableDropdownFilter.prototype, "data", void 0);
window.customElements.define('searchable-dropdown-filter', SearchableDropdownFilter);
