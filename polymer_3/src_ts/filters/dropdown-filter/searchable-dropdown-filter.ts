<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/etools-searchable-multiselection-menu/etools-single-selection-menu.html">

<link rel="import" href="../../../behaviors/filter.html">

<dom-module id="searchable-dropdown-filter">
  <template>
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
  </template>

  <script>
    Polymer({
      is: 'searchable-dropdown-filter',

      behaviors: [
        App.Behaviors.FilterBehavior,
      ],

      properties: {
        disabled: Boolean,
        selectedItem: Object,

        data: {
          type: Array,
          value: [],
          observer: '_handleData'
        },

        value: {
          type: String,
          value: '',
        },
      },

      _handleChange: function () {
        this.async(function () {
          this.fire('filter-changed', {
            name: this.name,
            value: String(this.selectedItem.id),
          });
        });
      },

      _handleData: function (data) {
        if (data.length) {
          this._filterReady();
        }
      },

      _addEventListeners: function () {
        this._handleChange = this._handleChange.bind(this);
        this.addEventListener('field.iron-select', this._handleChange);
      },

      _removeEventListeners: function () {
        this.removeEventListener('field.iron-select', this._handleChange);
      },

      attached: function () {
        this._addEventListeners();
      },

      detached: function () {
        this._removeEventListeners();
      },
    });
  </script>
</dom-module>
