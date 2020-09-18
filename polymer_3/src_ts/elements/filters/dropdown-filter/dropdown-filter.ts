import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import FilterMixin from '../../../mixins/filter-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {fireEvent} from '../../../utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 * @appliesMixin LocalizeMixin
 */
class DropdownFilter extends LocalizeMixin(FilterMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
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

  @property({type: Boolean})
  disabled!: boolean;

  @property({type: String})
  value = '';

  @property({type: Array, observer: '_handleData'})
  data!: any[];

  _handleFilterChange(e: CustomEvent) {
    if (!e.detail.selectedItem) {
      return;
    }
    const newValue = e.detail.selectedItem.id;

    fireEvent(this, 'filter-changed', {
      name: this.name,
      value: String(newValue)
    });
  }

  _handleData(data: any) {
    if (data) {
      this._filterReady();
    }
  }
}

window.customElements.define('dropdown-filter', DropdownFilter);
