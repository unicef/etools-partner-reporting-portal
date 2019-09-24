<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/dropdown-filter-multi.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/localize.html">
<link rel="import" href="../../../redux/actions/localize.html">

<dom-module id="pd-dropdown-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="programmeDocuments"
        url="[[programmeDocumentsUrl]]">
    </etools-prp-ajax>

    <dropdown-filter-multi
      class="item"
      label="[[localize('pd')]]"
      name="pds"
      value="[[value]]"
      data="[[data]]">
    </dropdown-filter-multi>
  </template>

  <script>
    Polymer({
      is: 'pd-dropdown-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        programmeDocumentsUrl: {
          type: String,
          computed: '_computeProgrammeDocumentsUrl(locationId)',
          observer: '_fetchPDs',
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

      _computeProgrammeDocumentsUrl: function (locationId) {
        return locationId ? App.Endpoints.programmeDocuments(locationId) : '';
      },

      _fetchPDs: function (url) {
        var self = this;

        if (!url) {
          return;
        }

        this.$.programmeDocuments.abort();

        this.$.programmeDocuments.thunk()()
            .then(function (res) {
              self.set('data', res.data.results);
            })
            .catch(function (err) { // jshint ignore:line
              // TODO: error handling
            });
      },

      detached: function () {
        this.$.programmeDocuments.abort();
      },

    });
  </script>
</dom-module>
