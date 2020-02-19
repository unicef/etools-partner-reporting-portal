<link rel="import" href="../../../bower_components/polymer/polymer.html">
<link rel="import" href="../../../bower_components/etools-loading/etools-loading.html">
<link rel="import" href="../../../bower_components/etools-data-table/etools-data-table.html">

<link rel="import" href="../list-placeholder.html">
<link rel="import" href="../../styles/table-styles.html">
<link rel="import" href="../../redux/store.html">
<link rel="import" href="../../behaviors/localize.html">
<link rel="import" href="../../redux/actions/localize.html">

<link rel="import" href="js/pd-details-reporting-requirements-functions.html">

<dom-module id="pd-details-reporting-requirements">
  <template>
    <style include="data-table-styles table-styles">
      :host {
        display: block;

        --header-title: {
          display: none;
        };

        --data-table-header: {
          height: auto;
        };
      }

      h3 {
        padding: 0 24px;
        margin: 0;
      }
    </style>

    <section>
      <h3>[[title]]</h3>

      <etools-data-table-header no-collapse no-title>
        <etools-data-table-column field="">
          [[localize('report_number')]]
        </etools-data-table-column>
        <etools-data-table-column field="">
          [[localize('due_date')]]
        </etools-data-table-column>
        <etools-data-table-column field="">
          [[localize('reporting_period')]]
        </etools-data-table-column>
      </etools-data-table-header>

      <template
          is="dom-repeat"
          items="[[data]]">
        <etools-data-table-row no-collapse>
          <div slot="row-data">
            <div class="table-cell">
              [[_getReportName(item.report_type, index, localize)]]
            </div>
            <div class="table-cell table-cell--text">
              [[item.due_date]]
            </div>
            <div class="table-cell table-cell--text">
              [[item.start_date]] - [[item.end_date]]
            </div>
          </div>
        </etools-data-table-row>
      </template>

      <list-placeholder
          data="[[data]]"
          loading="[[loading]]"
          message="No reports found">
      </list-placeholder>
    </section>
  </template>

  <script>
    Polymer({
      is: 'pd-details-reporting-requirements',

      behaviors: [
        App.Behaviors.UtilsBehavior,
        App.Behaviors.ReduxBehavior,
        App.Behaviors.LocalizeBehavior,
        Polymer.AppLocalizeBehavior,
      ],

      properties: {
        data: Array,
        loading: Boolean,
        title: String,
      },

      _getReportName: function (type, index, localize) {
        return PdDetailsReportingRequirementsUtils.getReportName(type, index, localize);
      },
    });
  </script>
</dom-module>
