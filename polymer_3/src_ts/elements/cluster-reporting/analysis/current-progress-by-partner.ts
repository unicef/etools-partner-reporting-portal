import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import '@google-web-components/google-chart';
import '../../../etools-prp-common/elements/numeral-js';
import './analysis-widget';
import '../../../etools-prp-common/elements/list-placeholder';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import AnalysisChartMixin from '../../../mixins/analysis-chart-mixin';
import Constants from '../../../etools-prp-common/constants';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';
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
        <div hidden$="[[!rows.length]]" slot="map">
          <google-chart type="bar" options="[[options]]" cols="[[cols]]" rows="[[rows]]"> </google-chart>
        </div>

        <list-placeholder
          slot="map"
          data="[[rows]]"
          message="[[localize('no_data_for')]] [[_localizeLowerCased(widgetTitle, localize)]]."
        >
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
      type: 'string'
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
      label: 'Progress',
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
        width: '50%'
      },
      bars: 'horizontal',
      legend: {
        position: 'bottom'
      }
    });
  }

  _computeRows(data: GenericObject) {
    return Object.keys(data || {}).map((key) => {
      const target = data[key].target;
      const progress = data[key].progress;

      return [
        key,
        this._fromJSON(target),
        this._buildTooltipContent(key, data[key]),
        progress,
        this._buildTooltipContent(key, data[key])
      ];
    }, this);
  }

  _buildTooltipContent(title: string, data: GenericObject) {
    const target = this._fromJSON(data.target);
    const inNeed = this._fromJSON(data.in_need);
    const progressAgainstTarget = data.progress / target;
    const progressAgainstInNeed = data.progress / inNeed;

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
      '</div>'
    ].join('\n');
  }
}

window.customElements.define('current-progress-by-partner', CurrentProgressByPartner);
