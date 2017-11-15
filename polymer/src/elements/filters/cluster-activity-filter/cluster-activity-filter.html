<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-location.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-query-params.html">

<link rel="import" href="../dropdown-filter/searchable-dropdown-filter.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/filter-dependencies.html">
<link rel="import" href="../../../endpoints.html">

<dom-module id="cluster-activity-filter">
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
        id="activities"
        url="[[activitiesUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="Activity"
        name="activity"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'cluster-activity-filter',

      behaviors: [
        App.Behaviors.FilterDependenciesBehavior,
        App.Behaviors.ReduxBehavior,
      ],

      properties: {
        queryParams: Object,

        activitiesUrl: {
          type: String,
          computed: '_computeActivitiesUrl(responsePlanId)',
        },

        responsePlanId: {
          type: String,
          statePath: 'responsePlans.currentID',
        },

        data: {
          type: Array,
          value: [],
        },

        defaultParams: {
          type: Object,
          value: {
            page_size: 99999,
          },
        },

        value: String,
      },

      observers: [
        '_fetchActivities(activitiesUrl, params)',
      ],

      _computeActivitiesUrl: function (responsePlanId) {
        return App.Endpoints.partnerActivityList(responsePlanId);
      },

      _fetchActivities: function () {
        this.debounce('fetch-activities', function () {
          var self = this;

          this.$.activities.abort();

          this.$.activities.thunk()()
              .then(function (res) {
                self.set('data', [{
                  id: '',
                  title: 'All',
                }].concat(res.data.results));
              })
              .catch(function (err) { // jshint ignore:line
                // TODO: error handling
              });
        }, 100);
      },

      detached: function () {
        this.$.activities.abort();

        if (this.isDebouncerActive('fetch-activities')) {
          this.cancelDebouncer('fetch-activities');
        }
      },
    });
  </script>
</dom-module>
