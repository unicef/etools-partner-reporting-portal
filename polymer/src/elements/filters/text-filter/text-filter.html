<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/paper-input/paper-input.html">

<link rel="import" href="../../../behaviors/filter.html">

<dom-module id="text-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <paper-input
        id="field"
        type="[[type]]"
        label="[[label]]"
        value="[[value]]"
        on-value-changed="_filterValueChanged"
        always-float-label>
    </paper-input>
  </template>

  <script>
    Polymer({
      is: 'text-filter',

      behaviors: [
        App.Behaviors.FilterBehavior,
      ],

      properties: {
        value: String,

        type: {
          type: String,
          value: 'text',
        },
      },

      _filterValueChanged: function () {
        this.debounce('input', function propagateChange() {
          if(this.$.field.value) {
            var newValue = this.$.field.value.trim();

            if (newValue !== this.lastValue) {
              this.fire('filter-changed', {
                name: this.name,
                value: newValue,
              });
            }
          }
        }, this._debounceDelay);
      },

      attached: function () {
        this._filterReady();
      },

      detached: function () {
        if (this.isDebouncerActive('input')) {
          this.cancelDebouncer('input');
        }
      },
    });
  </script>
</dom-module>
