<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/searchable-dropdown-filter.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/localize.html">
<link rel="import" href="../../../redux/actions/localize.html">

<dom-module id="location-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="locations"
        url="[[locationsUrl]]">
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
      is: 'location-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        locationsUrl: {
          type: String,
          computed: '_computeLocationsUrl(locationId)',
          observer: '_fetchLocations',
        },

        locationId: {
          type: String,
          statePath: 'location.id',
        },

        data: {
          type: Array,
          value: [],
        },

        value: String,
      },

      _computeLocationsUrl: function (locationId) {
        return locationId ? App.Endpoints.locations(locationId) : '';
      },

      _fetchLocations: function (url) {
        var self = this;

        if (!url) {
          return;
        }

        this.$.locations.abort();

        this.$.locations.thunk()()
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
        this.$.locations.abort();
      },
    });
  </script>
</dom-module>
