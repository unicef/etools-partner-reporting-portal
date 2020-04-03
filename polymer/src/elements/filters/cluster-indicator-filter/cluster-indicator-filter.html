<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/searchable-dropdown-filter.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/localize.html">

<dom-module id="cluster-indicator-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="indicatorNames"
        url="[[indicatorNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
        label="[[localize('indicator')]]"
        name="indicator"
        value="[[value]]"
        data="[[data]]">
    </searchable-dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'cluster-indicator-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        indicatorNamesUrl: {
          type: String,
          computed: '_computeIndicatorNamesUrl(responsePlanID)',
          observer: '_fetchIndicatorNames',
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

      _computeIndicatorNamesUrl: function (responsePlanID) {
        return App.Endpoints.clusterIndicatorNames(responsePlanID);
      },

      _fetchIndicatorNames: function () {
        var self = this;

        this.$.indicatorNames.abort();

        this.$.indicatorNames.thunk()()
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
        this.$.indicatorNames.abort();
      },
    });
  </script>
</dom-module>
