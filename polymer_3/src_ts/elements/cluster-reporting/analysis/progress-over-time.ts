import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {property} from '@polymer/decorators';
import Constants from '../../../constants';
import '@google-web-components/google-chart';
import '../../numeral-js';
import AnalysisChartMixin from '../../../mixins/analysis-chart-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import './analysis-widget';
import '../../list-placeholder';
import {GenericObject} from '../../../typings/globals.types';
declare const numeral: any;

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin AnalysisChartMixin
 */
class ProgressOverTime extends LocalizeMixin(UtilsMixin(AnalysisChartMixin(ReduxConnectedElement))) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }

        google-chart {
          width: 100%;
          height: 100%;
        }
      </style>

      <analysis-widget widget-title="[[_localizeLowerCased(widgetTitle, localize)]]">
        <div hidden$="[[!rows.length]]">
          <google-chart type="line" options="[[options]]" cols="[[cols]]" rows="[[rows]]"> </google-chart>
        </div>

        <list-placeholder data="[[rows]]" message="No data for [[_localizeLowerCased(widgetTitle, localize)]] yet.">
        </list-placeholder>
      </analysis-widget>
    `;
  }

  @property({type: Object})
  target!: GenericObject;

  @property({type: Object})
  inNeed!: GenericObject;

  @property({type: Array})
  data!: any;

  @property({type: String})
  widgetTitle = 'Progress over time';

  @property({type: Number, computed: '_fromJSON(target)'})
  actualTarget!: number;

  @property({type: Number, computed: '_fromJSON(inNeed)'})
  actualInNeed!: number;

  @property({type: Array})
  cols = [
    {
      label: 'Time',
      type: 'string'
    },
    {
      label: 'Progress',
      type: 'number'
    },
    {
      type: 'string',
      role: 'tooltip',
      p: {
        html: true
      }
    },
    {
      label: 'Target',
      type: 'number'
    },
    {
      type: 'string',
      role: 'tooltip',
      p: {
        html: true
      }
    },
    {
      label: 'In need',
      type: 'number'
    },
    {
      type: 'string',
      role: 'tooltip',
      p: {
        html: true
      }
    }
  ];

  @property({type: Array, computed: '_computeRowsLocal(data, actualTarget, actualInNeed)'})
  rows!: any;

  _computeOptions() {
    return Object.assign({}, this._baseOptions, {
      colors: ['#88c245', '#4069c5', '#f19e3a'],
      chartArea: {
        top: 20
      },
      legend: {
        position: 'bottom'
      }
    });
  }

  _computeRowsLocal(data: any, target: number, inNeed: number) {
    return data.map((tick: any) => {
      return [
        tick[0],
        this._fromJSON(tick[1]),
        this._buildProgressTooltipContent(tick, target, inNeed),
        target,
        this._buildDefaultTooltipContent('Target', target),
        inNeed,
        this._buildDefaultTooltipContent('In Need', inNeed)
      ];
    }, this);
  }

  _buildProgressTooltipContent(tick: any, target: number, inNeed: number) {
    const progress = this._fromJSON(tick[1]);
    const progressAgainstTarget = progress / target;
    const progressAgainstInNeed = progress / inNeed;

    return [
      '<div class="tooltip-content">',
      '<div>' + tick[0] + '</div>',
      '<div class="number-of-partners">',
      numeral(progress).format(Constants.FORMAT_NUMBER_DEFAULT),
      '</div>',
      '<div class="progress">',
      this._toPercentage(progressAgainstTarget) + ' of Target',
      '</div>',
      '<div class="progress">',
      this._toPercentage(progressAgainstInNeed) + ' of In Need',
      '</div>',
      '</div>'
    ].join('\n');
  }

  _buildDefaultTooltipContent(title: string, value: number) {
    return [
      '<div class="tooltip-content">',
      '<div>' + title + '</div>',
      '<div class="number-of-partners">',
      numeral(value).format(Constants.FORMAT_NUMBER_DEFAULT),
      '</div>',
      '</div>'
    ].join('\n');
  }
}

window.customElements.define('progress-over-time', ProgressOverTime);
