<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-location.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-query-params.html">

<link rel="import" href="../../../settings.html">
<link rel="import" href="../../../behaviors/filter-dependencies.html">
<link rel="import" href="../../../behaviors/localize.html">
<link rel="import" href="../dropdown-filter/dropdown-filter.html">

<dom-module id="narrow-location-type-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <dropdown-filter
        label="[[localize('narrow_location_type')]]"
        name="narrow_loc_type"
        value="[[fieldValue]]"
        data="[[data]]"
        disabled="[[disabled]]">
    </dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'narrow-location-type-filter',

      behaviors: [
        App.Behaviors.FilterDependenciesBehavior,
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        data: {
          type: Array,
          computed: '_computeData(params, maxLocType)',
        },

        maxLocType: {
          type: Number,
          value: App.Settings.cluster.maxLocType,
        },

        disabled: {
          type: Boolean,
          computed: '_computeDisabled(data)',
        },

        fieldValue: {
          type: String,
          computed: '_computeFieldValue(value, data, params.loc_type, maxLocType)',
        },

        value: String,
      },

      _computeData: function (params, maxLocType) {
        var validData = Array.apply(null, Array(maxLocType + 1))
            .map(function (_, index) {
              return {
                id: String(index),
                title: 'Admin' + index,
              };
            })
            .slice(Number(params.loc_type) + 1);

        return [
          {
            id: '',
            title: 'None',
          },
        ].concat(validData);
      },

      _computeDisabled: function (data) {
        return data && data.length === 1;
      },

      _computeFieldValue: function (value, data, locType, maxLocType) {
        switch (true) {
          case !value:
          case data.length === 1:
            return data[0].id;

          default:
            return Math.min(Math.max(Number(value), Number(locType) + 1), maxLocType);
        }
      },
    });
  </script>
</dom-module>
