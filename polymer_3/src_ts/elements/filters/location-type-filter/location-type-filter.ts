<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../../../settings.html">
<link rel="import" href="../dropdown-filter/dropdown-filter.html">
<link rel="import" href="../../../behaviors/localize.html">

<dom-module id="location-type-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <dropdown-filter
      label="[[localize('location_type')]]"
      name="loc_type"
      value="[[value]]"
      data="[[data]]">
    </dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'location-type-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        maxLocType: {
          type: Number,
          value: App.Settings.cluster.maxLocType,
        },

        data: {
          type: Array,
          computed: '_computeData(maxLocType)',
        },

        value: String,
      },

      _computeData: function (maxLocType) {
        return Array.apply(null, Array(maxLocType + 1))
            .map(function (_, index) {
              return {
                id: String(index),
                title: 'Admin' + index,
              };
            });
      },
    });
  </script>
</dom-module>
