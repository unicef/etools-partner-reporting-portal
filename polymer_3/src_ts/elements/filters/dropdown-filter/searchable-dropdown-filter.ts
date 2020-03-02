import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import FilterMixin from '../../../mixins/filter-mixin';
import {fireEvent} from '../../../utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 */
class SearchableDropdownFilter extends FilterMixin(PolymerElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
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
      trigger-value-change-event
      on-etools-selected-item-changed="_handleDropdownChange"
      >
    </etools-dropdown>
  `;
  }

  @property({type: Boolean})
  disabled!: boolean;

  @property({type: String})
  value = '';

  @property({type: String})
  name!: string;

  @property({type: String})
  label!: string;

  @property({type: Array, observer: '_handleData'})
  data = [];

  _handleDropdownChange(event: CustomEvent) {
    if (event.detail.selectedItem) {
      setTimeout(() => {
        fireEvent(this, 'filter-changed', {
          name: this.name,
          value: String(event.detail.selectedItem.id),
        });
      });
    }
  }

  _handleData(data: any) {
    if (data.length) {
      this._filterReady();
    }
  }

}

window.customElements.define('searchable-dropdown-filter', SearchableDropdownFilter);
