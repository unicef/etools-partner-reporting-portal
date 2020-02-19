import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
//@Lajos needs to be checked
import '@unicef-polymer/etools-searchable-multiselection-menu/etools-searchable-multiselection-menu';
import FilterMixin from '../../../mixins/filter-mixin';
import {GenericObject} from '../../../typings/globals.types';
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

    <etools-single-selection-menu
        id="field"
        label="[[label]]"
        options="[[data]]"
        option-value="id"
        option-label="title"
        selected="[[value]]"
        selected-item="{{selectedItem}}"
        disabled="[[disabled]]"
        trigger-value-change-event>
    </etools-single-selection-menu>
  `;
  }


  @property({type: Boolean})
  disabled!: boolean;

  @property({type: Object})
  selectedItem!: GenericObject;

  @property({type: String})
  value = '';

  @property({type: Array, observer: '_handleData'})
  data = [];

  _handleChange() {
    this.async(function() {
      fireEvent('filter-changed', {
        name: this.name,
        value: String(this.selectedItem.id),
      });
    });
  };

  _handleData(data: any) {
    if (data.length) {
      this._filterReady();
    }
  };

  _addEventListeners() {
    this._handleChange = this._handleChange.bind(this);
    this.addEventListener('field.iron-select', this._handleChange);
  };

  _removeEventListeners() {
    this.removeEventListener('field.iron-select', this._handleChange);
  };

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  };
}

window.customElements.define('searchble-dropdown-filter', SearchableDropdownFilter);
