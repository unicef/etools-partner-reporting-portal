<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/searchable-dropdown-filter.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/localize.html">

<dom-module id="cluster-partner-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax id="partnerNames" url="[[partnerNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter label="[[localize('partner')]]" name="partner" value="[[value]]" data="[[data]]">
    </searchable-dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'cluster-partner-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        partnerNamesUrl: {
          type: String,
          computed: '_computePartnerNamesUrl(responsePlanID)',
          observer: '_fetchPartnerNames',
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

      _computePartnerNamesUrl: function(responsePlanID) {
        return App.Endpoints.clusterPartnerNames(responsePlanID);
      },

      _fetchPartnerNames: function() {
        var self = this;

        this.$.partnerNames.abort();

        this.$.partnerNames.thunk()()
          .then(function(res) {
            self.set('data', [{
              id: '',
              title: 'All',
            }].concat(res.data));
          })
          .catch(function(err) { // jshint ignore:line
            // TODO: error handling
          });
      },

      detached: function() {
        this.$.partnerNames.abort();
      },
    });
  </script>
</dom-module>
