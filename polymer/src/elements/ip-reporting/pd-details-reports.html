<link rel="import" href="../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../bower_components/iron-location/iron-location.html">
<link rel="import" href="../../../bower_components/iron-location/iron-query-params.html">

<link rel="import" href="../../polyfills/es6-shim.html">
<link rel="import" href="../../elements/ip-reporting/pd-report-filters.html">
<link rel="import" href="../../elements/ip-reporting/pd-reports-toolbar.html">
<link rel="import" href="../../elements/ip-reporting/pd-reports-list.html">
<link rel="import" href="../../redux/store.html">
<link rel="import" href="../../redux/actions.html">

<link rel="import" href="js/pd-details-reports-functions.html">

<dom-module id="pd-details-reports">
  <template>
    <style include="data-table-styles table-styles">
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
        id="programmeDocuments"
        url="[[programmeDocumentsUrl]]">
    </etools-prp-ajax>

    <etools-prp-ajax
        id="pdReports"
        url="[[pdReportsUrl]]"
        params="[[pdReportsParams]]">
    </etools-prp-ajax>

    <page-body>
      <pd-report-filters></pd-report-filters>
      <pd-reports-toolbar></pd-reports-toolbar>
      <pd-reports-list></pd-reports-list>
    </page-body>

  </template>

  <script>
    Polymer({
      is: 'pd-details-reports',

      behaviors: [
        App.Behaviors.ReduxBehavior,
      ],

      properties: {
        pdId: {
          type: String,
          statePath: 'programmeDocuments.current',
        },

        locationId: {
          type: String,
          statePath: 'location.id',
        },

        pdReportsUrl: {
          type: String,
          computed: '_computePDReportsUrl(locationId)',
        },

        pdReportsParams: {
          type: Object,
          computed: '_computePDReportsParams(pdId, queryParams)',
        },

        programmeDocumentsUrl: {
          type: String,
          computed: '_computeProgrammeDocumentsUrl(locationId)',
        },

        pdReportsId: {
          type: String,
          statePath: 'programmeDocumentReports.current.id',
        },

        pdReportsCount: {
          type: Object,
          statePath: 'programmeDocumentReports.countByPD',
          observer: '_getPdReports',
        }
      },

      observers: [
        '_handleInputChange(pdReportsUrl, pdReportsParams)',
      ],

      _computePDReportsUrl: function (locationId) {
        return PdDetailsReportsUtils.computePDReportsUrl(locationId);
      },

      _computePDReportsParams: function (pdId, queryParams) {
        return PdDetailsReportsUtils.computePDReportsParams(pdId, queryParams);
      },

      _computeProgrammeDocumentsUrl: function (locationId) {
        return locationId ? App.Endpoints.programmeDocuments(locationId) : '';
      },

      _handleInputChange: function (url) {
        this.debounce('fetch-data', function () {
          var pdReportsThunk;

          if (!url) {
            return;
          }

          pdReportsThunk = this.$.pdReports.thunk();

          // Cancel the pending request, if any
          this.$.pdReports.abort();

          this.dispatch(App.Actions.PDReports.fetch(pdReportsThunk, this.pdId))
              .catch(function (err) { // jshint ignore:line
                // TODO: error handling
              });
        }, 300);
      },

      detached: function () {
        if (this.isDebouncerActive('fetch-data')) {
          this.cancelDebouncer('fetch-data');
        }
      },

      _getPdReports: function () {
        // Status being present prevents res.data from getting reports,
        // preventing pd-details title from rendering. Deleting the status
        // can resolve this issue, and filter will still work
        if (this.pdReportsCount[this.pdId] > 0 && this.pdReportsId === '') {
          this.debounce('fetch-pds', function () {
            var pdThunk = this.$.programmeDocuments;
            pdThunk.params = {
              page: 1,
              page_size: 10,
              programme_document: this.pdId
            };

            // Cancel the pending request, if any
            this.$.programmeDocuments.abort();

            this.dispatch(App.Actions.PD.fetch(pdThunk.thunk()))
              .catch(function (err) { // jshint ignore:line
                // TODO: error handling
              });
          }, 100);
        }
      },
    });
  </script>
</dom-module>
