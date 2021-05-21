import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../etools-prp-common/ReduxConnectedElement';
import {property} from '@polymer/decorators';
import '@google-web-components/google-chart';
import AnalysisChartMixin from '../../../etools-prp-common/mixins/analysis-chart-mixin';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import UtilsMixin from '../../../etools-prp-common/mixins/utils-mixin';
import './analysis-widget';
import '../../../etools-prp-common/elements/list-placeholder';
import {GenericObject} from '../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin AnalysisChartMixin
 */
class PartnersPerClusterObjective extends LocalizeMixin(UtilsMixin(AnalysisChartMixin(ReduxConnectedElement))) {
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
  widgetTitle = 'Partners per Cluster Objective';

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.analysis.operationalPresence.dataLoading)'})
  loading!: boolean;

  @property({
    type: Object,
    computed: 'getReduxStateObject(rootState.analysis.operationalPresence.data.partners_per_cluster_objective)'
  })
  data!: GenericObject;

  @property({type: Array})
  cols = [
    {
      label: 'Cluster Objective',
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
      chartArea: {
        // top: 0,
        left: '40%',
        width: '40%'
      },
      height: rows.length * 45 + 30,
      colors: rows.map(function () {
        return '#88c245';
      })
    });
  }
}

window.customElements.define('partners-per-cluster-objective', PartnersPerClusterObjective);
