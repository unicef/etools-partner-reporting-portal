<link rel="import" href="../../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-location.html">
<link rel="import" href="../../../../bower_components/iron-location/iron-query-params.html">

<link rel="import" href="../dropdown-filter/searchable-dropdown-filter.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/filter-dependencies.html">
<link rel="import" href="../../../behaviors/localize.html">

<dom-module id="cluster-project-filter">
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
        id="projectNames"
        url="[[projectNamesUrl]]"
        params="[[params]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('project')]]"
        name="project"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'cluster-project-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.FilterDependenciesBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        queryParams: Object,

        projectNamesUrl: {
          type: String,
          computed: '_computeProjectNamesUrl(responsePlanID)',
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
        '_fetchProjectNames(projectNamesUrl, params)',
      ],

      _computeProjectNamesUrl: function (responsePlanID) {
        return App.Endpoints.clusterProjectNames(responsePlanID);
      },

      _fetchProjectNames: function () {
        this.debounce('fetch-project-names', function () {
          var self = this;

          this.$.projectNames.abort();

          this.$.projectNames.thunk()()
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
        this.$.projectNames.abort();

        if (this.isDebouncerActive('fetch-project-names')) {
          this.cancelDebouncer('fetch-project-names');
        }
      },
    });
  </script>
</dom-module>
