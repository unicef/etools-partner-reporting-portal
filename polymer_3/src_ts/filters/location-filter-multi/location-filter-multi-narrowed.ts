<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-location.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-query-params.html">

<link rel="import" href="../dropdown-filter/dropdown-filter-multi.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/filter-dependencies.html">
<link rel="import" href="../../../behaviors/localize.html">
<link rel="import" href="../../../redux/actions/localize.html">

<dom-module id="location-filter-multi-narrowed">
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

    <etools-prp-ajax
        id="locations"
        url="[[locationsUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="[[localize('location')]]"
        name="locs"
        value="[[value]]"
        on-value-changed="_onValueChanged"
        data="[[data]]"
        disabled="[[pending]]">
    </dropdown-filter-multi>
  </template>

  <script>
    Polymer({
      is: 'location-filter-multi-narrowed',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.FilterDependenciesBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        locationsUrl: {
          type: String,
          computed: '_computeLocationsUrl(responsePlanId)',
        },

        responsePlanId: {
          type: String,
          statePath: 'responsePlans.currentID',
        },

        data: {
          type: Array,
          value: [],
        },

        pending: {
          type: Boolean,
          value: false,
        },

        value: String,
      },

      observers: [
        '_fetchLocations(locationsUrl, params)',
      ],

      _computeLocationsUrl: function (responsePlanId) {
        return App.Endpoints.clusterLocationNames(responsePlanId);
      },

      _fetchLocations: function () {
        this.debounce('fetch-locations', function () {
          var self = this;

          this.set('pending', true);

          this.$.locations.abort();

          this.$.locations.thunk()()
              .then(function (res) {
                self.set('pending', false);
                self.set('data', res.data.results);
              })
              .catch(function (err) { // jshint ignore:line
                // TODO: error handling
                self.set('pending', false);
              });
        });
      },

      _onValueChanged: function (e) {

        if (e.detail.value === '') {
          return;
        }
      },

      detached: function () {
        if (this.isDebouncerActive('fetch-locations')) {
          this.cancelDebouncer('fetch-locations');
        }
      },
    });
  </script>
</dom-module>
