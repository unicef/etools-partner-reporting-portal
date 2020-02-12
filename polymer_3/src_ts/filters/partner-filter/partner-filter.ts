<link rel="import" href="../../../../bower_components/polymer/polymer.html">

<link rel="import" href="../dropdown-filter/searchable-dropdown-filter.html">
<link rel="import" href="../../etools-prp-ajax.html">
<link rel="import" href="../../../endpoints.html">
<link rel="import" href="../../../redux/store.html">
<link rel="import" href="../../../behaviors/localize.html">

<dom-module id="partner-filter">
  <template>
    <style>
      :host {
        display: block;
      }
    </style>

    <etools-prp-ajax
        id="partnerNames"
        url="[[partnerNamesUrl]]">
    </etools-prp-ajax>

    <searchable-dropdown-filter
      label="[[localize('partner')]]"
      name="partner"
      value="[[computedValue]]"
      data="[[data]]">
    </searchable-dropdown-filter>
  </template>

  <script>
    Polymer({
      is: 'partner-filter',

      behaviors: [
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        data: Array,
        value: String,
        computedValue: String,
        required: Boolean,

        partnerNamesUrl: {
          type: String,
          computed: '_computeUrl(responsePlanID)',
          observer: '_fetchPartnerNames',
        },

        responsePlanID: {
          type: String,
          statePath: 'responsePlans.currentID',
        },
      },

      observers: [
        '_computeValue(data, value)',
      ],

      _computeUrl: function (responsePlanID) {
        return App.Endpoints.clusterPartnerNames(responsePlanID);
      },

      _computeValue: function (data, value) {
        this.debounce('compute-value', function () {
          var index = data.findIndex(function (item) {
            return value === String(item.id);
          });

          this.set('computedValue', data[index === -1 ? 0 : index].id);
        }, 100);
      },

      _fetchPartnerNames: function () {
        var self = this;

        this.$.partnerNames.abort();

        this.$.partnerNames.thunk()()
            .then(function (res) {
              var data = (self.required ? [] : [{
                id: '',
                title: 'All',
              }]).concat(res.data);

              self.set('data', data);
            })
            .catch(function (err) { // jshint ignore:line
              // TODO: error handling
            });
      },

      detached: function () {
        this.$.partnerNames.abort();

        if (this.isDebouncerActive('compute-value')) {
          this.cancelDebouncer('compute-value');
        }
      },
    });
  </script>
</dom-module>
