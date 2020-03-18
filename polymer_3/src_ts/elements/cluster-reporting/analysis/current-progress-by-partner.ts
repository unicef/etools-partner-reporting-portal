import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import '@google-web-components/google-chart';
import '../../numeral-js';
import './analysis-widget';
import '../../list-placeholder';
import UtilsMixin from '../../../mixins/utils-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import AnalysisChartMixin from '../../../mixins/analysis-chart-mixin';
import Constants from '../../../constants';
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
class CurrentProgressByPartner extends UtilsMixin(LocalizeMixin(AnalysisChartMixin(ReduxConnectedElement))) {

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
        <google-chart
            type="bar"
            options="[[options]]"
            cols="[[cols]]"
            rows="[[rows]]">
        </google-chart>
      </div>

      <list-placeholder
          data="[[rows]]"
          message="No data for [[_localizeLowerCased(widgetTitle, localize)]] yet.">
      </list-placeholder>
    </analysis-widget>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  widgetTitle = 'Current progress by Partner';

  @property({type: Array})
  cols = [
    {
      label: 'Partner',
      type: 'string',
    },
    {
      label: 'Target',
      type: 'number',
    },
    {
      type: 'string',
      role: 'tooltip',
      p: {
        html: true,
      },
    },
    {
      label: 'Progress',
      type: 'number',
    },
    {
      type: 'string',
      role: 'tooltip',
      p: {
        html: true,
      },
    },
  ];

  @property({type: Array, computed: '_computeRows(data)'})
  rows!: any;

  _computeOptions(rows: any) {
    return Object.assign({}, this._baseOptions, {
      height: rows.length * 45 + 40,
      colors: ['#e0e0e0', '#88c245'],
      chartArea: {
        top: 0,
        bottom: 55,
        left: '30%',
        width: '50%',
      },
      bars: 'horizontal',
      legend: {
        position: 'bottom',
      },
    });
  }

  _computeRows(data: GenericObject) {
    return Object.keys(data || {}).map(function(key) {
      let target = data[key].target;
      let progress = data[key].progress;

      return [
        key,
        this._fromJSON(target),
        this._buildTooltipContent(key, data[key]),
        progress,
        this._buildTooltipContent(key, data[key]),
      ];
    }, this);
  }

  _buildTooltipContent(title: string, data: GenericObject) {
    let target = this._fromJSON(data.target);
    let inNeed = this._fromJSON(data.in_need);
    let progressAgainstTarget = data.progress / target;
    let progressAgainstInNeed = data.progress / inNeed;

    return [
      '<div class="tooltip-content">',
      '<div>' + title + '</div>',
      '<div class="number-of-partners">',
      numeral(data.progress).format(Constants.FORMAT_NUMBER_DEFAULT),
      '</div>',
      '<div class="progress">',
      this._toPercentage(progressAgainstTarget) + ' of Target',
      '</div>',
      '<div class="progress">',
      this._toPercentage(progressAgainstInNeed) + ' of In Need',
      '</div>',
      '<br>',
      '<div>Locations:</div>',
      '<div>' + this._commaSeparated(data.locations) + '</div>',
      '</div>',
    ].join('\n');
  }

}

window.customElements.define('current-progress-by-partner', CurrentProgressByPartner);
