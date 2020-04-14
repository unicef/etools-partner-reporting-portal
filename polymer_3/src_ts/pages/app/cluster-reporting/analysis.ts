import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/app-route/app-route';

import UtilsMixin from '../../../mixins/utils-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import '../../../elements/page-header';
import '../../../elements/page-body';
import '../../../elements/cluster-reporting/analysis/analysis-filters';
import './analysis/operational-presence';
import './analysis/indicators';
import {GenericObject} from '../../../typings/globals.types';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReportingAnalysis extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  public static get template() {
    return html`
    <style>
      :host {
        display: block;
      }

      paper-tabs {
        margin-bottom: 25px;
        border-bottom: 1px solid var(--paper-grey-300);
      }
    </style>

    <app-route
        route="{{route}}"
        pattern="/:tab"
        data="{{routeData}}">
    </app-route>

    <page-header title="[[localize('analysis')]]"></page-header>

    <page-body>
      <analysis-filters></analysis-filters>

      <paper-tabs
          selected="{{tab}}"
          attr-for-selected="name"
          scrollable
          hide-scroll-buttons>
        <paper-tab name="operational-presence">[[localize('operational_presence')]]</paper-tab>
        <paper-tab name="indicators">[[localize('indicators')]]</paper-tab>
      </paper-tabs>

      <iron-pages
          selected="[[tab]]"
          attr-for-selected="name">
        <template
            is="dom-if"
            if="[[_equals(tab, 'operational-presence')]]"
            restamp="true">
          <page-analysis-operational-presence
              name="operational-presence">
          </page-analysis-operational-presence>
        </template>
        <template
            is="dom-if"
            if="[[_equals(tab, 'indicators')]]"
            restamp="true">
          <page-analysis-indicators
              name="indicators">
          </page-analysis-indicators>
        </template>
      </iron-pages>
    </page-body>
  `;
  }

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, observer: '_tabChanged'})
  tab!: string;


  static get observers() {
    return [
      '_routeTabChanged(routeData.tab)'
    ];
  }

  _tabChanged(tab: string) {
    if (tab !== this.routeData.tab) {
      this.set('route.path', tab);
    }
  }

  _routeTabChanged(tab: string) {
    this.tab = tab || 'operational-presence';
  }

}

window.customElements.define('page-cluster-reporting-analysis', PageClusterReportingAnalysis);
