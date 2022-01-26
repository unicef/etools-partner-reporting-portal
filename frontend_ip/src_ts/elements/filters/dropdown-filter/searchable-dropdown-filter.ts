import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import FilterMixin from '../../../etools-prp-common/mixins/filter-mixin';
import {fireEvent} from '../../../etools-prp-common/utils/fire-custom-event';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

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
        #field {
          width: 100%;
        }
      </style>

      <etools-dropdown
        id="field"
        label="[[label]]"
        options="[[data]]"
        option-value="id"
        option-label="[[optionLabel]]"
        selected="[[value]]"
        disabled="[[disabled]]"
        selected-item="{{selectedItem}}"
        trigger-value-change-event
        on-etools-selected-item-changed="_handleDropdownChange"
      >
      </etools-dropdown>
    `;
  }

  @property({type: Object})
  selectedItem!: GenericObject;

  @property({type: Boolean})
  disabled!: boolean;

  @property({type: String})
  value = '';

  @property({type: String})
  name!: string;

  @property({type: String})
  label!: string;

  @property({type: String})
  optionLabel = 'title';

  @property({type: Array, observer: '_handleData'})
  data = [];

  _handleDropdownChange(event: CustomEvent) {
    if (event.detail.selectedItem) {
      setTimeout(() => {
        fireEvent(this, 'filter-changed', {
          name: this.name,
          value: String(event.detail.selectedItem.id)
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
