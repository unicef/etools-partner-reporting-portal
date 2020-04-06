import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import '@google-web-components/google-chart';
import '@polymer/paper-card/paper-card';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/app-layout/app-grid/app-grid-style';
import {dashboardWidgetStyles} from '../../../styles/dashboard-widget-styles'
import LocalizeMixin from '../../../mixins/localize-mixin';
import '../../etools-prp-number';
import '../../chart-legend';
import {GenericObject} from '../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class IndicatorsByStatus extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
      ${dashboardWidgetStyles}
      <style include="app-grid-style">
      :host {
        display: block;

        --app-grid-columns: 3;
        --app-grid-gutter: 16px;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 2;
      }

      .widget-heading {
        margin-bottom: 1.5em;
      }

      google-chart {
        width: 100%;
        height: 100%;
      }

      .app-grid {
        margin: -var(--app-grid-gutter);
      }

      .item-wide {
        @apply --app-grid-expandible-item;
      }
    </style>

    <paper-card class="widget-container">
      <h3 class="widget-heading">[[localize('partner_activity_indicators')]]</h3>

      <div class="app-grid">
        <div class="item">
          <google-chart
              type="pie"
              options="[[chartOptions]]"
              cols="[[chartCols]]"
              rows="[[chartRows]]">
          </google-chart>
        </div>
        <div class="item item-wide">
          <chart-legend
              rows="[[chartRows]]"
              colors="[[colors]]">
          </chart-legend>
        </div>
      </div>

      <etools-loading active="[[loading]]"></etools-loading>
    </paper-card>
    `;
  }

  @property({type: Object, computed: '_computeChartOptions(colors)'})
  chartOptions!: GenericObject;

  @property({type: Array})
  chartCols = [
    {label: 'Status', type: 'string'},
    {label: 'Count', type: 'number'},
  ];

  @property({type: Array})
  colors = [
    '#029a53',
    '#2bb0f2',
    '#d8d8d8',
    '#fecc02',
    '#273d48',
  ];

  @property({type: Array})
  labels = [
    'Met',
    'On Track',
    'No Progress',
    'Constrained',
    'No Status',
  ];

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_met_indicator_reports)'})
  met_count!: number;

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_on_track_indicator_reports)'})
  on_track_count!: number;

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_no_progress_indicator_reports)'})
  no_progress_count!: number;

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_constrained_indicator_reports)'})
  constrained_count!: number;

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_no_status_indicator_reports)'})
  no_status_count!: number;

  @property({
    type: Array,
    computed: '_computeChartRows(labels, ' +
      [
        'met_count',
        'on_track_count',
        'no_progress_count',
        'constrained_count',
        'no_status_count',
      ].join(', ') +
      ')',
  })
  chartRows!: any[];

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)'})
  loading!: boolean;

  _computeChartOptions(colors: any) {
    return {
      chartArea: {
        left: 0,
        top: 0,
        width: '90%',
        height: '90%',
      },
      enableInteractivity: false,
      legend: 'none',
      pieSliceText: 'none',
      colors: colors,
    };
  }

  _getColor(colors: any, index: any) {
    return colors[index];
  }

  _computeChartRows(labels: any[]) {
    var data = [].slice.call(arguments, 1);

    var localizedLabels = labels.map(function(label: any) { // convert labels to localized label keys
      return label.split(' ').join('_').toLowerCase();
    });

    return data.map(function(count, index) {
      return [
        localizedLabels[index],
        count,
      ];
    });
  }
}

window.customElements.define('indicators-by-status', IndicatorsByStatus);

export {IndicatorsByStatus as IndicatorsByStatusEl};
