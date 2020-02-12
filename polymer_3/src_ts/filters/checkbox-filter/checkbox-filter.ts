<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/paper-checkbox/paper-checkbox.html">

<link rel="import" href="../../../behaviors/filter.html">
<link rel="import" href="../../../behaviors/utils.html">

<dom-module id="checkbox-filter">
  <template>
    <style>
      :host {
        display: block;
      }

      ::content .checkbox-label {
        font-size: 12px;
      }
    </style>

    <paper-checkbox
        id="field"
        name="[[name]]"
        checked="{{checked}}">
      <content></content>
    </paper-checkbox>
  </template>

  <script>
    Polymer({
      is: 'checkbox-filter',

      behaviors: [
        App.Behaviors.FilterBehavior,
        App.Behaviors.UtilsBehavior,
      ],

      properties: {
        checked: {
          type: Boolean,
          computed: '_computeChecked(value)',
        },

        value: {
          type: String,
          value: '',
        },
      },

      _handleInput: function () {
        this.debounce('change', function propagateChange() {
          var newValue = '' + this._toNumber(this.$.field.checked);

          if (newValue !== this.lastValue) {
            this.fire('filter-changed', {
              name: this.name,
              value: newValue,
            });
          }
        }, this._debounceDelay);
      },

      _computeChecked: function (value) {
        return value ? !!this._toNumber(value) : false;
      },

      _addEventListeners: function () {
        this._handleInput = this._handleInput.bind(this);
        this.addEventListener('field.change', this._handleInput);
      },

      _removeEventListeners: function () {
        this.removeEventListener('field.change', this._handleInput);
      },

      attached: function () {
        this._addEventListeners();
        this._filterReady();
      },

      detached: function () {
        this._removeEventListeners();
        if (this.isDebouncerActive('change')) {
          this.cancelDebouncer('change');
        }
      },
    });
  </script>
</dom-module>
