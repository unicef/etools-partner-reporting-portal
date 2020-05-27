import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import FilterMixin from '../../../mixins/filter-mixin';
import {fireEvent} from '../../../utils/fire-custom-event';


/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 */
class DropdownFilterMulti extends FilterMixin(PolymerElement) {
  static get template() {
    return html`
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
      disabled="[[disabled]]">
    </etools-dropdown-multi>
  `;
  }

  @property({type: String})
  value!: string;

  @property({type: Boolean})
  disabled!: boolean;

  @property({type: Boolean})
  hideSearch!: boolean;

  @property({type: Array, observer: '_handleData'})
  data!: any[];

  @property({type: Array})
  selectedValues = [];

  public static get observers() {
    return [
      '_setSelectedValues(value, data)'
    ];
  }

  _handleChange(e: CustomEvent) {
    if (e.detail.selectedItems && this.data) {
      const newValue = e.detail.selectedItems.map((item: any) => item['id']).join(',');
      if (newValue !== this.value) {
        fireEvent(this, 'filter-changed', {
          name: this.name,
          value: String(newValue || '')
        });
      }
    }
  }

  _handleData(data: any) {
    if (data) {
      this._filterReady();
    } else if (this.name === 'location' || this.name === 'locs') {
      // Locations get populated by PDs so user can filter by location, so if there are no PDs,
      // there are no locations - in that case, fire filterReady method to have filters stop loading.
      this._filterReady();
    }
  }

  _setSelectedValues(value: any) {
    if (typeof value === 'string' && value !== this.selectedValues.join(',')) {
      this.set('selectedValues', value.split(',').filter(Boolean));
    }
  }

}

window.customElements.define('dropdown-filter-multi', DropdownFilterMulti);
