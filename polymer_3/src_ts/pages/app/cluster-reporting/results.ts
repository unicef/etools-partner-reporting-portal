import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
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
import LocalizeMixin from '../../../mixins/utils-mixin';
import {GenericObject} from '../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReportingResults extends LocalizeMixin(UtilsMixin(PolymerElement)) {

  public static get template() {
    return html`
    <style>
      :host {
        display: block;

        --cluster-report-content: {
          border-width: 0 1px 1px;
          border-style: solid;
          border-color: var(--paper-grey-300);
        };
      }

      .tabs paper-tab {
        text-transform: uppercase;
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
      <div class="tabs">
        <paper-tabs
            selected="{{tab}}"
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

      <iron-pages
          selected="[[tab]]"
          attr-for-selected="name">
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

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, observer: '_tabChanged'})
  tab!: string;


  static get observers() {
    return [
      '_routeTabChanged(routeData.tab)',
    ];
  }

  _tabChanged(tab: string) {
    if (tab !== this.routeData.tab) {
      this.set('route.path', tab);
    }
  }

  _routeTabChanged(tab: string) {
    this.tab = tab || 'draft';
  }

  _resetPage() {
    this.set('queryParams.page', 1);
  }

}

window.customElements.define('page-cluster-reporting-results', PageClusterReportingResults);
