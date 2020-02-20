import {html, PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
//@Lajos Needs to BE CHECKED
import '@polymer/moment-element/moment-import';

import '@polymer/paper-input/paper-input';
import '@polymer/iron-icons/iron-icons';
//<link rel="import" href="../../../../bower_components/etools-datepicker/etools-datepicker.html">
import '@unicef-polymer/etools-datepicker/etools-datepicker';

import FilterMixin from '../../../mixins/filter-mixin';
import DateMixin from '../../../mixins/date-mixin';
import {fireEvent} from '../../../utils/fire-custom-event';


/**
 * @polymer
 * @customElement
 * @appliesMixin FilterMixin
 * @appliesMixin DateMixin
 */
class DateFilter extends FilterMixin(DateMixin(PolymerElement)) {
  static get template() {
    return html`
    <style>
      :host {
        display:block;
      };
    </style>
    <paper-input
      id="field"
      type="[[type]]"
      label="[[label]]"
      value="[[prettyDate(value, format)]]"
      on-down="openDatePicker"
      data-selector="datePickerButton"
      always-float-label>
      <etools-datepicker-button
        id="datePickerButton"
        format="[[format]]"
        pretty-date="{{value}}"
        json-date="{{jsonValue}}"
        date="[[prepareDate(value)]]"
        no-init
        prefix>
      </etools-datepicker-button>
    </paper-input>
  `;
  }


  @property({type: String})
  value!: string;

  @property({type: String})
  type = 'text';
  //@Lajos needs to be investigated
  @property({type: any, notify: 'true'})
  jsonValue!: any;

  @property({type: String})
  format = 'DD MMM YYYY';

  _handleInput() {
    var newValue = this.$.field.value;
    //initially this.fire
    fireEvent(this, 'filter-changed', {
      name: this.name,
      value: newValue,
    });
  };

  _addEventListeners() {
    this._handleInput = this._handleInput.bind(this);
    this.addEventListener('field.value-changed', this._handleInput);
  };

  _removeEventListeners() {
    this.removeEventListener('field.value-changed', this._handleInput);
  };

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
    this._filterReady();
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  };
}

window.customElements.define('date-filter', DateFilter);
