var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/polymer/lib/elements/dom-repeat';
/**
 * @polymer
 * @customElement
 */
class DropdownFormInput extends PolymerElement {
    constructor() {
        super(...arguments);
        this.data = [];
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }

      paper-dropdown-menu {
        width: 100%;
      }
    </style>

    <paper-dropdown-menu
        id="field"
        label="[[label]]"
        disabled="[[disabled]]"
        required="[[required]]"
        invalid="{{invalid}}"
        always-float-label>
      <paper-listbox
          slot="dropdown-content"
          class="dropdown-content"
          on-iron-select="_getValue"
          selected="{{value}}">
        <template
            id="repeat"
            is="dom-repeat"
            items="[[data]]">
          <paper-item>[[item.title]]</paper-item>
        </template>
      </paper-listbox>
    </paper-dropdown-menu>
  `;
    }
    validate() {
        return this.$.field.validate();
    }
    _getValue(e) {
        const newValue = this.$.repeat.itemForElement(e.detail.item).id;
        this.value = newValue;
    }
}
__decorate([
    property({ type: Array })
], DropdownFormInput.prototype, "data", void 0);
__decorate([
    property({ type: Object, notify: true })
], DropdownFormInput.prototype, "value", void 0);
__decorate([
    property({ type: String })
], DropdownFormInput.prototype, "disabled", void 0);
window.customElements.define('dropdown-form-input', DropdownFormInput);
export { DropdownFormInput as DropdownFormInputEl };
