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
      on-etools-selected-items-changed="_handleChange"
      hide-search="[[hideSearch]]"
      disabled="[[disabled]]">
    </etools-dropdown-multi>
  `;
  }


  @property({type: Boolean})
  disabled!: boolean;

  @property({type: Boolean})
  hideSearch!: boolean;

  @property({type: Array, observer: '_handleData'})
  data = [];

  @property({type: Array})
  selectedValues = [];

  public static get observers() {
    return [
      '_setSelectedValues(value, data)',
    ]
  }

  _handleChange(e: CustomEvent, detail: any) {
    var newValue;

    if (detail.path === 'selectedValues.splices') {
      newValue = detail.value.indexSplices[0].object;
    } else if (!detail.path) {
      newValue = detail.value;
    }

    if (typeof newValue === 'undefined') {
      return;
    }

    fireEvent(this, 'filter-changed', {
      name: this.name,
      value: String(newValue || ''),
    });
  }

  _handleData(data: any) {
    if (data.length) {
      this._filterReady();
    } else if (this.name === 'location') {
      // Locations get populated by PDs so user can filter by location, so if there are no PDs,
      // there are no locations - in that case, fire filterReady method to have filters stop loading.
      this._filterReady();
    }
  }

  _setSelectedValues(value: any) {
    setTimeout(() => {
      if (value) {
        this.set('selectedValues', value.split(',').filter(Boolean));
      }
    });
  }

}

window.customElements.define('dropdown-filter-multi', DropdownFilterMulti);
