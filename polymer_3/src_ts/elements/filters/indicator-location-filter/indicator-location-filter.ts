<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/searchable-dropdown-filter.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/localize.html">

<dom-module id="indicator-location-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="locationNames"
        url="[[locationNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('location')]]"
        name="location"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'indicator-location-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        locationNamesUrl: {
          type: String,
          computed: '_computeLocationNamesUrl(responsePlanID)',
          observer: '_fetchLocationNames',
        },

        responsePlanID: {
          type: String,
          statePath: 'responsePlans.currentID',
        },

        data: {
          type: Array,
          value: [],
        },

        value: String,
      },

      _computeLocationNamesUrl: function (responsePlanID) {
        return App.Endpoints.clusterIndicatorLocations(responsePlanID);
      },

      _fetchLocationNames: function () {
        var self = this;

        this.$.locationNames.abort();

        this.$.locationNames.thunk()()
            .then(function (res) {
              self.set('data', [{
                id: '',
                title: 'All',
              }].concat(res.data));
            })
            .catch(function (err) { // jshint ignore:line
              // TODO: error handling
            });
      },

      detached: function () {
        this.$.locationNames.abort();
      },
    });
  </script>
</dom-module>
