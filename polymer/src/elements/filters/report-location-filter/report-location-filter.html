<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/searchable-dropdown-filter.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/localize.html">
<link rel="import" href="../../../redux/actions/localize.html">

<dom-module id="report-location-filter">
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
        data="[[options]]">
    </searchable-dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'report-location-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        value: String,

        options: {
          type: Array,
          value: [],
        },

        locationId: {
          type: String,
          statePath: 'location.id',
        },

        reportId: {
          type: String,
          statePath: 'programmeDocumentReports.current.id',
        },

        locationsUrl: {
          type: String,
          computed: '_computeLocationsUrl(locationId, reportId)',
          observer: '_fetchLocations',
        },
      },

      _computeLocationsUrl: function (locationId, reportId) {
        return App.Endpoints.indicatorDataLocation(locationId, reportId);
      },

      _fetchLocations: function () {
        var self = this;

        this.$.locations.abort();

        this.$.locations.thunk()()
            .then(function (res) {
              self.set('options', [{
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
