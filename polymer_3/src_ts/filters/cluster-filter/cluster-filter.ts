<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-location.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-query-params.html">

<link rel="import" href="../dropdown-filter/dropdown-filter.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/localize.html">
<link rel="import" href="../../../behaviors/filter-dependencies.html">

<dom-module id="cluster-filter">
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
        id="clusterNames"
        url="[[clusterNamesUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <dropdown-filter
        label="[[localize('cluster')]]"
        name="cluster_id"
        value="[[value]]"
        data="[[data]]">
    </dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'cluster-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.FilterDependenciesBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        queryParams: Object,

        clusterNamesUrl: {
          type: String,
          computed: '_computeClusterNamesUrl(responsePlanID)',
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

      observers: [
        '_fetchClusterNames(clusterNamesUrl, params)',
      ],

      _computeClusterNamesUrl: function (responsePlanID) {
        return App.Endpoints.clusterNames(responsePlanID);
      },

      _fetchClusterNames: function () {
        this.debounce('fetch-cluster-names', function () {
          var self = this;

          this.$.clusterNames.abort();

          this.$.clusterNames.thunk()()
              .then(function (res) {
                self.set('data', [{
                  id: '',
                  title: 'All',
                }].concat(res.data));
              })
              .catch(function (err) { // jshint ignore:line
                // TODO: error handling
              });
        }, 100);
      },

      detached: function () {
        this.$.clusterNames.abort();

        if (this.isDebouncerActive('fetch-cluster-names')) {
          this.cancelDebouncer('fetch-cluster-names');
        }
      },
    });
  </script>
</dom-module>
