import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {property} from '@polymer/decorators';
import '@google-web-components/google-chart';
import AnalysisChartMixin from '../../../mixins/analysis-chart-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import './analysis-widget';
import '../../list-placeholder';
import {GenericObject} from '../../../typings/globals.types';

/**
* @polymer
* @customElement
* @mixinFunction
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin AnalysisChartMixin
*/
class PartnersByStatus extends LocalizeMixin(UtilsMixin(AnalysisChartMixin(ReduxConnectedElement))) {

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
  widgetTitle = 'Partners by Status';

  @property({type: Array})
  cols = [
    {
      label: 'Status',
      type: 'string',
    },
    {
      label: 'Count',
      type: 'number',
    },
  ];

  @property({type: Array, computed: '_computeRowsLocal(data, localize)'})
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

      // TODO: tooltips
      enableInteractivity: false,
      tooltip: null,
    });
  }

  _computeRowsLocal(data: GenericObject, localize: string) {
    var self = this;
    return Object.keys(data || {}).map(function(key) {
      return [
        self._localizeLowerCased(key, localize),
        data[key],
      ];
    });
  }

}

window.customElements.define('partners-by-status', PartnersByStatus);
