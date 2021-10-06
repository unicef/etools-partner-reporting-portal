var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import '@google-web-components/google-chart';
import '@polymer/paper-card/paper-card';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/app-layout/app-grid/app-grid-style';
import { dashboardWidgetStyles } from '../../../styles/dashboard-widget-styles';
import LocalizeMixin from '../../../mixins/localize-mixin';
import '../../etools-prp-number';
import '../../chart-legend';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class IndicatorsByStatus extends LocalizeMixin(ReduxConnectedElement) {
    constructor() {
        super(...arguments);
        this.chartCols = [
            { label: 'Status', type: 'string' },
            { label: 'Count', type: 'number' }
        ];
        this.colors = [
            '#029a53',
            '#2bb0f2',
            '#d8d8d8',
            '#fecc02',
            '#273d48'
        ];
        this.labels = [
            'Met',
            'On Track',
            'No Progress',
            'Constrained',
            'No Status'
        ];
    }
    static get template() {
        return html `
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
    _computeChartOptions(colors) {
        return {
            chartArea: {
                left: 0,
                top: 0,
                width: '90%',
                height: '90%'
            },
            enableInteractivity: false,
            legend: 'none',
            pieSliceText: 'none',
            colors: colors
        };
    }
    _getColor(colors, index) {
        return colors[index];
    }
    _computeChartRows(labels) {
        const data = [].slice.call(arguments, 1);
        const localizedLabels = labels.map(function (label) {
            return label.split(' ').join('_').toLowerCase();
        });
        return data.map(function (count, index) {
            return [
                localizedLabels[index],
                count
            ];
        });
    }
}
__decorate([
    property({ type: Object, computed: '_computeChartOptions(colors)' })
], IndicatorsByStatus.prototype, "chartOptions", void 0);
__decorate([
    property({ type: Array })
], IndicatorsByStatus.prototype, "chartCols", void 0);
__decorate([
    property({ type: Array })
], IndicatorsByStatus.prototype, "colors", void 0);
__decorate([
    property({ type: Array })
], IndicatorsByStatus.prototype, "labels", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_met_indicator_reports)' })
], IndicatorsByStatus.prototype, "met_count", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_on_track_indicator_reports)' })
], IndicatorsByStatus.prototype, "on_track_count", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_no_progress_indicator_reports)' })
], IndicatorsByStatus.prototype, "no_progress_count", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_constrained_indicator_reports)' })
], IndicatorsByStatus.prototype, "constrained_count", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_no_status_indicator_reports)' })
], IndicatorsByStatus.prototype, "no_status_count", void 0);
__decorate([
    property({
        type: Array,
        computed: '_computeChartRows(labels, ' +
            [
                'met_count',
                'on_track_count',
                'no_progress_count',
                'constrained_count',
                'no_status_count'
            ].join(', ') +
            ')'
    })
], IndicatorsByStatus.prototype, "chartRows", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)' })
], IndicatorsByStatus.prototype, "loading", void 0);
window.customElements.define('indicators-by-status', IndicatorsByStatus);
export { IndicatorsByStatus as IndicatorsByStatusEl };
