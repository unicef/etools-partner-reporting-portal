import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
//@Lajos: IMPORTANT NOTICE: bellow does not exists!!!!!!
//<link rel="import" href="../../../../bower_components/google-chart/google-chart.html">
import '@polymer/google-chart/google-chart';
import {NumeralJsEl} from '../../numeral-js';
import './analysis-widget';
import '../../list-placeholder';
import UtilsMixin from '../../../mixins/utils-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import AnalysisChartMixin from '../../../mixins/analysis-chart-mixin';
import Constants from '../../../constants';
import {GenericObject} from '../../../typings/globals.types';
//<link rel="import" href="../../../polyfills/es6-shim.html">
declare const numeral: any;

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin AnalysisChartMixin
 */
class CurrentProgressByLocation extends UtilsMixin(LocalizeMixin(AnalysisChartMixin(ReduxConnectedElement))) {

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
  //
  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  widgetTitle = 'Current progress by Location';

  @property({type: Array})
  cols = [
    {
      label: 'Location',
      type: 'string',
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
      height: rows.length * 45 + 30,
      colors: rows.map(function() {
        return '#88c245';
      }),
      chartArea: {
        top: 0,
        left: '30%',
        width: '50%',
      },
    });
  }

  _computeRows(data: GenericObject) {
    return Object.keys(data || {}).map(function(key) {
      return [
        key,
        data[key].progress,
        this._buildTooltipContent(key, data[key]),
      ];
    }, this);
  },

  _buildTooltipContent(title: string, data: GenericObject) {
    return [
      '<div class="tooltip-content">',
      '<div>' + title + '</div>',
      '<div class="number-of-partners">',
      numeral(data.progress).format(Constants.FORMAT_NUMBER_DEFAULT),
      '</div>',
      '<div>Contributing Partners:</div>',
      '<div>' + this._commaSeparated(data.partners) + '</div>',
      '</div>',
    ].join('\n');
  }
}

window.customElements.define('current-progress-by-location', CurrentProgressByLocation);
