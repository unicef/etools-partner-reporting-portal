import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/app-layout/app-grid/app-grid-style';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import '../../etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../etools-prp-ajax';
import '../../etools-prp-number';
import '../../frequency-of-reporting';
import './partners-by-status';
import './progress-over-time';
import './current-progress-by-location';
import './current-progress-by-partner';
import './current-progress-by-project';
import {GenericObject} from '../../../typings/globals.types';
import {analysis_indicators_fetchSingle} from '../../../redux/actions/analysis';

/**
* @polymer
* @customElement
* @mixinFunction
* @appliesMixin LocalizeMixin
* @appliesMixin UtilsMixin
*/
class IndicatorDetails extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment app-grid-style">
      :host {
        display: block;
        min-height: 150px;
        position: relative;

        --app-grid-columns: 2;
        --app-grid-gutter: 25px;
        --app-grid-item-height: auto;
      }

      .header {
        padding: 10px 25px;
        background: var(--paper-grey-100);
      }

      .indicator-data {
        margin: 0;
        font-size: 12px;
      }

      .indicator-data dt {
        color: var(--theme-primary-text-color-medium);
      }

      .indicator-data dd {
        margin: 0;
      }

      .col:nth-child(1) dt {
        width: 140px;
      }

      .col:nth-child(1) dd {
        color: var(--theme-secondary-text-color);
      }

      .col:nth-child(1) dt {
        width: 140px;
      }

      .col:nth-child(2) .indicator-data {
        padding: 1.5em 0;
      }

      .col:nth-child(2) {
        padding: 0 15px;
        border-right: 1px solid var(--paper-grey-300);
      }

      .col:nth-child(2) dt {
        margin-right: 20px;
      }

      .col:nth-child(3) dt {
        width: 80px;
        text-align: right;
      }

      .col:nth-child(3) dd {
        width: 80px;
        text-align: right;
        color: var(--theme-secondary-text-color);
      }

      hr {
        border-top: 0;
        border-bottom: 1px solid var(--paper-grey-200);
      }
    </style>

    <etools-prp-ajax
        id="indicator"
        url="[[indicatorUrl]]">
    </etools-prp-ajax>

    <template
        is="dom-if"
        if="[[!loading]]"
        restamp="true">
      <div class="header layout horizontal justified">
        <div class="col flex-none">
          <dl class="indicator-data layout horizontal">
            <dt>[[localize('indicator_type')]]:</dt>
            <dd>[[_localizeLowerCased(data.indicator_type, localize)]]</dd>
          </dl>
          <dl class="indicator-data layout horizontal">
            <dt>[[localize('reporting_frequency')]]:</dt>
            <dd>
              <frequency-of-reporting
                  type="[[data.frequency]]">
              </frequency-of-reporting>
            </dd>
          </dl>
          <dl class="indicator-data layout horizontal">
            <dt>[[localize('number_of_partners_reporting')]]:</dt>
            <dd>[[data.num_of_partners]]</dd>
          </dl>
        </div>

        <div class="col flex layout self-center">
          <dl class="indicator-data layout horizontal end-justified">
            <dt>[[localize('reached')]]:</dt>
            <dd>
              <strong>
                <template
                    is="dom-if"
                    if="[[_equals(data.display_type, 'number')]]"
                    restamp="true">
                  <etools-prp-number value="[[data.total.v]]"></etools-prp-number>
                </template>
                <template
                    is="dom-if"
                    if="[[!_equals(data.display_type, 'number')]]"
                    restamp="true">
                  <span>[[_toPercentage(data.total.c)]]</span>
                </template>
              </strong>
            </dd>
          </dl>
        </div>

        <div class="col flex-none">
          <dl class="indicator-data layout horizontal">
            <dt>[[localize('baseline')]]:</dt>
            <dd>
              <template
                  is="dom-if"
                  if="[[_equals(data.display_type, 'number')]]"
                  restamp="true">
                <etools-prp-number value="[[data.baseline.v]]"></etools-prp-number>
              </template>
              <template
                  is="dom-if"
                  if="[[!_equals(data.display_type, 'number')]]"
                  restamp="true">
                <span>[[_toPercentage(data.baseline.c)]]</span>
              </template>
            </dd>
          </dl>
          <dl class="indicator-data layout horizontal">
            <dt>[[localize('target')]]:</dt>
            <dd>
              <template
                  is="dom-if"
                  if="[[_equals(data.display_type, 'number')]]"
                  restamp="true">
                <etools-prp-number value="[[data.target.v]]"></etools-prp-number>
              </template>
              <template
                  is="dom-if"
                  if="[[!_equals(data.display_type, 'number')]]"
                  restamp="true">
                <span>[[_toPercentage(data.target.c)]]</span>
              </template>
            </dd>
          </dl>
          <dl class="indicator-data layout horizontal">
            <dt>[[localize('in_need_simple')]]:</dt>
            <dd>
              <template
                  is="dom-if"
                  if="[[_equals(data.display_type, 'number')]]"
                  restamp="true">
                <etools-prp-number value="[[data.in_need.v]]"></etools-prp-number>
              </template>
              <template
                  is="dom-if"
                  if="[[!_equals(data.display_type, 'number')]]"
                  restamp="true">
                <span>[[_toPercentage(data.in_need.c)]]</span>
              </template>
            </dd>
          </dl>
        </div>
      </div>

      <div class="app-grid">
        <partners-by-status
            class="item"
            data="[[data.partners_by_status]]">
        </partners-by-status>

        <progress-over-time
            class="item"
            target="[[data.target]]"
            in-need="[[data.in_need]]"
            data="[[data.progress_over_time]]">
        </progress-over-time>
      </div>

      <hr>

      <div class="app-grid">
        <current-progress-by-partner
            class="item"
            data="[[data.current_progress_by_partner]]">
        </current-progress-by-partner>

        <current-progress-by-location
            class="item"
            data="[[data.current_progress_by_location]]">
        </current-progress-by-location>
      </div>

      <hr>

      <template
          is="dom-if"
          if="[[_equals(data.indicator_type, 'Partner Activity Indicator')]]">
        <div class="app-grid">
          <current-progress-by-project
              class="item"
              data="[[data.current_progress_by_project]]"
              partner-num-data="[[data.num_of_partners]]">
          </current-progress-by-project>
        </div>
      </template>
    </template>

    <etools-loading active="[[loading]]"></etools-loading>
    `;
  }

  @property({type: String})
  indicatorId!: string;

  @property({type: Boolean})
  initialized = false;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanId!: string;

  @property({type: String, computed: '_computeIndicatorUrl(responsePlanId, indicatorId)'})
  indicatorUrl!: string;

  @property({type: Object, computed: 'getReduxStateObject(rootState.analysis.indicators.indicatorData.byId)'})
  indicatorsById!: GenericObject;

  @property({type: Object, computed: 'getReduxStateObject(rootState.analysis.indicators.indicatorData.loadingById)'})
  indicatorsLoadingById!: GenericObject;

  @property({type: Object, computed: '_prop(indicatorsById, indicatorId)'})
  data!: GenericObject;

  @property({type: Boolean, computed: '_prop(indicatorsLoadingById, indicatorId)'})
  loading!: boolean;

  _computeIndicatorUrl(responsePlanId: string, indicatorId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.analysisIndicator(responsePlanId, indicatorId);
  }

  init() {
    var indicatorThunk = (this.$.indicator as EtoolsPrpAjaxEl).thunk();;

    if (this.initialized) {
      return;
    }

    this.set('initialized', true);
    (this.$.indicator as EtoolsPrpAjaxEl).abort();
    this.reduxStore.dispatch(
      analysis_indicators_fetchSingle(indicatorThunk, this.indicatorId))
      //@ts-ignore
      .catch(function(_err: any) {
        // TODO: error handling
      });
  }
}

window.customElements.define('analysis-indicator-details', IndicatorDetails);
