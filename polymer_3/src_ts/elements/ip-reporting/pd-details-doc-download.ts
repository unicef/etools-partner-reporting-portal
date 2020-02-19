<link rel="import" href="../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../bower_components/app-layout/app-grid/app-grid-style.html">
<link rel="import" href="../../../bower_components/iron-icon/iron-icon.html">
<link rel="import" href="../../../bower_components/etools-loading/etools-loading.html">
<link rel="import" href="../../../bower_components/paper-spinner/paper-spinner.html">

<link rel="import" href="../../settings.html">
<link rel="import" href="../../redux/store.html">
<link rel="import" href="../../redux/selectors/programmeDocuments.html">
<link rel="import" href="../../behaviors/utils.html">
<link rel="import" href="../../styles/table-styles.html">

<link rel="import" href="../../elements/etools-prp-ajax.html">
<link rel="import" href="../../redux/actions.html">
<link rel="import" href="../../behaviors/utils.html">
<link rel="import" href="../../behaviors/sorting.html">
<link rel="import" href="../../behaviors/notifications.html">
<link rel="import" href="../../redux/store.html">
<link rel="import" href="../../redux/selectors/programmeDocuments.html">
<link rel="import" href="../../endpoints.html">

<link rel="import" href="js/pd-details-doc-download-functions.html">

<dom-module id="pd-details-doc-download">
  <template>
    <style>
      .spinner-size {
        width: 19px;
        height: 19px;
      }
      [hidden] {
        display: none !important;
      }
    </style>

    <div>
      <!--Text-->
      <paper-spinner hidden="[[!spinnerActive]]" class="spinner-size" active="[[spinnerActive]]"></paper-spinner>
      <a href="" on-click="_openDoc">Download Document</a>
    </div>
    <etools-prp-ajax
        id="pddoc"
        url="[[pdDocumentUrl]]">
    </etools-prp-ajax>


  </template>
  <script>
    Polymer({
      is: 'pd-details-doc-download',

      behaviors: [
        App.Behaviors.UtilsBehavior,
        App.Behaviors.ReduxBehavior,
        App.Behaviors.NotificationsBehavior
      ],

      properties: {
        spinnerActive: {
          type: Boolean,
          value: false
        },
        pd: {
          type: Object,
          value: {},
          statePath: App.Selectors.ProgrammeDocuments.current
        },
        locationId: {
          type: String,
          statePath: 'location.id',
        },

        pdDocumentUrl: {
          type: String,
          computed: '_computeDocUrl(locationId, pd.id)'
        },
        docUrl: {
          type: String
        }
      },

      _computeDocUrl: function (locationId, pdId) {
        return PdDetailsDocDownloadUtils.computeDocUrl(locationId, pdId);
      },

      _openDoc: function (e) {
        var self = this;
        e.preventDefault();
        this.set('spinnerActive', true);
        this.$.pddoc.thunk()()
            .then(function (res) {
              self.set('spinnerActive', false);
              console.log(res);
              if (res.status !== 200 || !res.data.signed_pd_document_file) {
                // Fire Toast with error
                self._notifyServerError();
                console.error(res);
              } else {
                var anchor = document.createElement('a');
                anchor.setAttribute('href', res.data.signed_pd_document_file);
                anchor.setAttribute('target', '_blank');
                anchor.dispatchEvent(new MouseEvent('click',
                  {bubbles: true, cancelable: true, view: window})
                );
                anchor.delete();
              }
            });
      }
      });
    </script>


</dom-module>
