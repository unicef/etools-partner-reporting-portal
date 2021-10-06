var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
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
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReportingAnalysis extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
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
    static get observers() {
        return [
            '_routeTabChanged(routeData.tab)'
        ];
    }
    _tabChanged(tab) {
        if (tab !== this.routeData.tab) {
            this.set('route.path', tab);
        }
    }
    _routeTabChanged(tab) {
        this.tab = tab || 'operational-presence';
    }
}
__decorate([
    property({ type: Object })
], PageClusterReportingAnalysis.prototype, "routeData", void 0);
__decorate([
    property({ type: Object })
], PageClusterReportingAnalysis.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, observer: '_tabChanged' })
], PageClusterReportingAnalysis.prototype, "tab", void 0);
window.customElements.define('page-cluster-reporting-analysis', PageClusterReportingAnalysis);
