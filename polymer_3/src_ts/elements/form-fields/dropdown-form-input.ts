import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/polymer/lib/elements/dom-repeat';
import {DomRepeat} from '@polymer/polymer/lib/elements/dom-repeat';

/**
 * @polymer
 * @customElement
 */
class DropdownFormInput extends PolymerElement {

  static get template() {
    return html`
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

  @property({type: Array})
  data = [];

  @property({type: Object, notify: true})
  value!: any;

  @property({type: String})
  disabled!: string;

  validate() {
    return (this.$.field as any).validate();
  }

  _getValue(e: CustomEvent) {
    const newValue = (this.$.repeat as DomRepeat).itemForElement(e.detail.item).id;
    this.value = newValue;
  }

}

window.customElements.define('dropdown-form-input', DropdownFormInput);

export {DropdownFormInput as DropdownFormInputEl};
