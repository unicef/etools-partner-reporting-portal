import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '../dropdown-filter/searchable - dropdown - filter';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
//<link rel="import" href="../../../polyfills/es6-shim.html">\

import '@unicef-polymer/etools-searchable-multiselection-menu/etools-searchable-multiselection-menu';
import FilterMixin from '../../../mixins/filter-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {fireEvent} from '../../../utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 * @appliesMixin LocalizeMixin
 */
class DropdownFilter extends FilterMixin(LocalizeMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }

      paper-dropdown-menu {
        width: 100%;
      }

      paper-item {
        white-space: nowrap;
      }
    </style>

    <paper-dropdown-menu
        id="field"
        label="[[label]]"
        disabled="[[disabled]]"
        always-float-label>
      <paper-listbox
          slot="dropdown-content"
          class="dropdown-content"
          selected="[[selected]]">
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


  @property({type: Boolean})
  disabled!: boolean;

  @property({type: Number})
  selected!: number;

  @property({type: String})
  value = '';

  @property({type: Array, observer: '_handleData'})
  data = [];


  public static get observers() {
    return [
      '_updateSelected(value, data)',
    ]
  }

  _handleChange(e: CustomEvent) {
    var newValue = this.$.repeat.itemForElement(e.detail.item).id;

    fireEvent('filter-changed', {
      name: this.name,
      value: String(newValue),
    });
  };

  _updateSelected(value: String, data: any) {
    this.async(function() {
      this.set('selected', data.findIndex(function(item: any) {
        return String(item.id) === String(value);
      }));
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
    super.connectedCallback();
    this._removeEventListeners();
  };
}

window.customElements.define('dropdown-filter', DropdownFilter);
