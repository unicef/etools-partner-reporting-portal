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
class PartnersPerType extends LocalizeMixin(UtilsMixin(AnalysisChartMixin(ReduxConnectedElement))) {
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

      <analysis-widget widget-title="[[_localizeLowerCased(widgetTitle, localize)]]" loading="[[loading]]">
        <div hidden$="[[!rows.length]]" slot="map">
          <google-chart type="bar" options="[[options]]" cols="[[cols]]" rows="[[rows]]"> </google-chart>
        </div>

        <list-placeholder slot="map" data="[[rows]]" message="[[localize('no_data_for')]] [[widgetTitle]].">
        </list-placeholder>
      </analysis-widget>
    `;
  }

  @property({type: String})
  widgetTitle = 'Partners per Type';

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.analysis.operationalPresence.dataLoading)'})
  loading!: boolean;

  @property({
    type: Object,
    computed: 'getReduxStateObject(rootState.analysis.operationalPresence.data.partners_per_type)'
  })
  data!: GenericObject;

  @property({type: Array})
  cols = [
    {
      label: 'Type',
      type: 'string'
    },
    {
      label: 'Count',
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
      })
    });
  }
}

window.customElements.define('partners-per-type', PartnersPerType);
