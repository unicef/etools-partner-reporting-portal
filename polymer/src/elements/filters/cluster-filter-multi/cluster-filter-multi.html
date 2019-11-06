<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/dropdown-filter-multi.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/localize.html">

<dom-module id="cluster-filter-multi">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="clusters"
        url="[[clustersUrl]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="[[localize('clusters')]]"
        name="clusters"
        value="[[value]]"
        data="[[data]]">
    </dropdown-filter-multi>
  </template>

  <script>
    Polymer({
      is: 'cluster-filter-multi',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        clustersUrl: {
          type: String,
          computed: '_computeClustersUrl(responsePlanId)',
          observer: '_fetchClusters',
        },

        responsePlanId: {
          type: String,
          statePath: 'responsePlans.currentID',
        },

        data: {
          type: Array,
          value: [],
        },

        value: String,
      },

      _computeClustersUrl: function (responsePlanId) {
        return App.Endpoints.clusterNames(responsePlanId);
      },

      _fetchClusters: function () {
        var self = this;

        this.$.clusters.abort();

        this.$.clusters.thunk()()
            .then(function (res) {
              self.set('data', res.data);
            })
            .catch(function (err) { // jshint ignore:line
              // TODO: error handling
            });
      },

      detached: function () {
        this.$.clusters.abort();
      },
    });
  </script>
</dom-module>
