var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from "../../../ReduxConnectedElement";
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../elements/page-header';
import '../../../elements/page-body';
import '../../../elements/cluster-reporting/cluster-report-filters';
import '../../../elements/cluster-reporting/cluster-reports';
import UtilsMixin from '../../../mixins/utils-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReportingResults extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
    <style>
      :host {
        display: block;

        --cluster-report-content: {
          border-width: 0 1px 1px;
          border-style: solid;
          border-color: var(--paper-grey-300);
        };
      }
    </style>

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <app-route
        route="{{route}}"
        pattern="/:tab"
        data="{{routeData}}">
    </app-route>

    <page-header title="[[localize('reporting_results')]]">
      <div slot="tabs">
        <paper-tabs
            selected="{{tab}}"
            selectable="paper-tab"
            attr-for-selected="name"
            on-iron-activate="_resetPage"
            scrollable
            hide-scroll-buttons>
          <paper-tab name="draft">[[localize('draft_due_reports')]]</paper-tab>
          <paper-tab name="submitted">[[localize('submitted_reports')]]</paper-tab>
        </paper-tabs>
      </div>
    </page-header>

    <page-body>
      <cluster-report-filters></cluster-report-filters>

      <iron-pages selected="[[tab]]" attr-for-selected="name">
        <template
            is="dom-if"
            if="[[_equals(tab, 'draft')]]"
            restamp="true">
          <cluster-reports
              submitted="0"
              mode="draft"
              name="draft">
          </cluster-reports>
        </template>

        <template
            is="dom-if"
            if="[[_equals(tab, 'submitted')]]"
            restamp="true">
          <cluster-reports
              submitted="1"
              mode="view"
              name="submitted">
          </cluster-reports>
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
        this.tab = tab || 'draft';
    }
    _resetPage() {
        this.set('queryParams.page', 1);
    }
}
__decorate([
    property({ type: Object })
], PageClusterReportingResults.prototype, "routeData", void 0);
__decorate([
    property({ type: String })
], PageClusterReportingResults.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], PageClusterReportingResults.prototype, "queryParams", void 0);
__decorate([
    property({ type: Object })
], PageClusterReportingResults.prototype, "route", void 0);
__decorate([
    property({ type: String, observer: '_tabChanged' })
], PageClusterReportingResults.prototype, "tab", void 0);
window.customElements.define('page-cluster-reporting-results', PageClusterReportingResults);
