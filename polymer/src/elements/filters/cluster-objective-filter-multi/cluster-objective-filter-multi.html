<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-location.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-query-params.html">

<link rel="import" href="../dropdown-filter/dropdown-filter-multi.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/filter-dependencies.html">
<link rel="import" href="../../../behaviors/localize.html">

<dom-module id="cluster-objective-filter-multi">
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
        id="objectives"
        url="[[objectivesUrl]]"
        params="[[objectivesParams]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
        label="[[localize('cluster_objective')]]"
        name="cluster_objectives"
        value="[[value]]"
        data="[[data]]"
        disabled="[[pending]]">
    </dropdown-filter-multi>
  </template>

  <script>
    Polymer({
      is: 'cluster-objective-filter-multi',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.FilterDependenciesBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        objectivesUrl: {
          type: String,
          computed: '_computeObjectivesUrl(responsePlanId)',
        },

        responsePlanId: {
          type: String,
          statePath: 'responsePlans.currentID',
        },

        data: {
          type: Array,
          value: [],
        },

        objectivesParams: {
          type: Object,
          computed: '_computeObjectivesParams(params)',
          observer: '_fetchObjectives',
        },

        pending: {
          type: Boolean,
          value: false,
        },

        value: String,
      },

      _computeObjectivesUrl: function (responsePlanId) {
        return App.Endpoints.responseParametersClusterObjectives(responsePlanId);
      },

      _computeObjectivesParams: function (params) {
        var objectivesParams = {
          page_size: 99999,
        };

        if (params.clusters) {
          objectivesParams.cluster_ids = params.clusters;
        }

        return objectivesParams;
      },

      _fetchObjectives: function () {
        this.debounce('fetch-objectives', function () {
          var self = this;

          this.set('pending', true);

          this.$.objectives.abort();

          this.$.objectives.thunk()()
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

      detached: function () {
        if (this.isDebouncerActive('fetch-objectives')) {
          this.cancelDebouncer('fetch-objectives');
        }
      },
    });
  </script>
</dom-module>
