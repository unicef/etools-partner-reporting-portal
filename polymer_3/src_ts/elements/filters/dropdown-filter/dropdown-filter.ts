<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/paper-dropdown-menu/paper-dropdown-menu.html">
<link rel="import" href="../../../../bower_components/paper-listbox/paper-listbox.html">
<link rel="import" href="../../../../bower_components/paper-item/paper-item.html">

<link rel="import" href="../../../polyfills/es6-shim.html">
<link rel="import" href="../../../behaviors/filter.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/localize.html">
<link rel="import" href="../../../redux/actions/localize.html">


<dom-module id="dropdown-filter">
  <template>
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
  </template>

  <script>
    Polymer({
      is: 'dropdown-filter',

      behaviors: [
        App.Behaviors.FilterBehavior,
        App.Behaviors.ReduxBehavior,
        App.Behaviors.UtilsBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        data: {
          type: Array,
          value: [],
          observer: '_handleData',
        },

        value: {
          type: String,
          value: '',
        },

        selected: Number,

        disabled: Boolean
      },

      observers: [
        '_updateSelected(value, data)',
      ],

      _handleChange: function (e) {
        var newValue = this.$.repeat.itemForElement(e.detail.item).id;

        this.fire('filter-changed', {
          name: this.name,
          value: String(newValue),
        });
      },

      _updateSelected: function (value, data) {
        this.async(function () {
          this.set('selected', data.findIndex(function (item) {
            return String(item.id) === String(value);
          }));
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
