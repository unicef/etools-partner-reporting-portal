<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/moment-element/moment-import.html">
<link rel="import" href="../../../../bower_components/paper-input/paper-input.html">
<link rel="import" href="../../../../bower_components/iron-icons/iron-icons.html">
<link rel="import" href="../../../../bower_components/etools-datepicker/etools-datepicker.html">

<link rel="import" href="../../../behaviors/filter.html">
<link rel="import" href="../../../behaviors/date.html">

<dom-module id="date-filter">
  <template>
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
  </template>
  <script>
    Polymer({
      is: 'date-filter',

      behaviors: [
        App.Behaviors.FilterBehavior,
        App.Behaviors.DateBehavior,
      ],

      properties: {
        value: String,

        type: {
          type: String,
          value: 'text',
        },
        jsonValue: {
          value: null,
          notify: true
        },
        format: {
          type: String,
          value: 'DD MMM YYYY'
        }
      },

      _handleInput: function () {
        var newValue = this.$.field.value;
        this.fire('filter-changed', {
          name: this.name,
          value: newValue,
        });
      },

      _addEventListeners: function () {
        this._handleInput = this._handleInput.bind(this);
        this.addEventListener('field.value-changed', this._handleInput);
      },

      _removeEventListeners: function () {
        this.removeEventListener('field.value-changed', this._handleInput);
      },

      attached: function () {
        this._addEventListeners();
        this._filterReady();
      },

      detached: function () {
        this._removeEventListeners();
      },
    });
  </script>
</dom-module>
