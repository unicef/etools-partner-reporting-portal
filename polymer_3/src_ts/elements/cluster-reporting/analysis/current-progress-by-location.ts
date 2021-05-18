import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import '@google-web-components/google-chart';
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
  widgetTitle = 'Current progress by Location';

  @property({type: Array})
  cols = [
    {
      label: 'Location',
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
    }
  ];

  @property({type: Array, computed: '_computeRows(data)'})
  rows!: any;

  _computeOptions(rows: any) {
    return Object.assign({}, this._baseOptions, {
      height: rows.length * 45 + 30,
      colors: rows.map(function () {
        return '#88c245';
      }),
      chartArea: {
        top: 0,
        left: '30%',
        width: '50%'
      }
    });
  }

  _computeRows(data: GenericObject) {
    return Object.keys(data || {}).map((key) => {
      return [key, data[key].progress, this._buildTooltipContent(key, data[key])];
    }, this);
  }

  _buildTooltipContent(title: string, data: GenericObject) {
    return [
      '<div class="tooltip-content">',
      '<div>' + title + '</div>',
      '<div class="number-of-partners">',
      numeral(data.progress).format(Constants.FORMAT_NUMBER_DEFAULT),
      '</div>',
      '<div>Contributing Partners:</div>',
      '<div>' + this._commaSeparated(data.partners) + '</div>',
      '</div>'
    ].join('\n');
  }
}

window.customElements.define('current-progress-by-location', CurrentProgressByLocation);
