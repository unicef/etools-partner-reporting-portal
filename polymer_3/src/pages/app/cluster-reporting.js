var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/app-route/app-location';
import '@polymer/iron-pages/iron-pages';
import '../../elements/etools-prp-ajax';
import '../../elements/page-title';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import { workspaceId } from '../../redux/selectors/workspace';
import { getDomainByEnv } from '../../config';
import { fetchResponsePlans } from '../../redux/actions';
import '../../pages/app/cluster-reporting/select-plan';
import '../../pages/app/cluster-reporting/router';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReporting extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <page-title title="[[localize('cluster_reporting')]]"></page-title>

    <etools-prp-ajax
        id="responsePlans"
        url="[[plansUrl]]">
    </etools-prp-ajax>

    <app-location
        query-params="{{queryParams}}">
    </app-location>

    <app-route
        route="{{route}}"
        pattern="/:page"
        data="{{routeData}}"
        tail="{{subroute}}">
    </app-route>

    <iron-pages
        selected="[[page]]"
        attr-for-selected="name">
      <template
          is="dom-if"
          if="[[_equals(page, 'select-plan')]]"
          restamp="true">
        <page-cluster-reporting-select-plan
            name="select-plan"
            route="{{subroute}}">
        </page-cluster-reporting-select-plan>
      </template>

      <template
          is="dom-if"
          if="[[_equals(page, 'router')]]">
        <page-cluster-reporting-router
            name="router"
            route="{{subroute}}">
        </page-cluster-reporting-router>
      </template>
    </iron-pages>
`;
    }
    static get observers() {
        return [
            '_routePageChanged(routeData.page)',
        ];
    }
    _workspaceId(rootState) {
        return workspaceId(rootState);
    }
    _routePageChanged(page) {
        switch (page) {
            case 'select-plan':
                this.set('page', page);
                break;
            case void 0:
            case '':
                this.set('route.path', 'select-plan');
                this.set('page', 'select-plan');
                break;
            case 'plan':
                this.set('page', 'router');
                break;
        }
    }
    async _pageChanged(page) {
        const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/cluster-reporting/${page}.js`;
        console.log('cluster reporting... :' + resolvedPageUrl);
        await import(resolvedPageUrl).catch((err) => {
            console.log(err);
            this._notFound();
        });
    }
    _computeResponsePlansUrl(workspaceId) {
        return workspaceId ? Endpoints.responsePlans(workspaceId) : '';
    }
    _fetchResponsePlans(url) {
        if (!url) {
            return;
        }
        const responsePlansThunk = this.$.responsePlans.thunk();
        this.reduxStore.dispatch(fetchResponsePlans(responsePlansThunk))
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling
        });
    }
    _addEventListeners() {
        this._fetchResponsePlans = this._fetchResponsePlans.bind(this);
        this.addEventListener('refresh-plan-list', this._fetchResponsePlans);
    }
    _removeEventListeners() {
        this.removeEventListener('refresh-plan-list', this._fetchResponsePlans);
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
    }
}
__decorate([
    property({ type: Object })
], PageClusterReporting.prototype, "route", void 0);
__decorate([
    property({ type: Object })
], PageClusterReporting.prototype, "subroute", void 0);
__decorate([
    property({ type: Object })
], PageClusterReporting.prototype, "queryParams", void 0);
__decorate([
    property({ type: String, observer: '_pageChanged' })
], PageClusterReporting.prototype, "page", void 0);
__decorate([
    property({ type: String, computed: '_workspaceId(rootState)' })
], PageClusterReporting.prototype, "workspaceId", void 0);
__decorate([
    property({ type: String, computed: '_computeResponsePlansUrl(workspaceId)', observer: '_fetchResponsePlans' })
], PageClusterReporting.prototype, "plansUrl", void 0);
window.customElements.define('page-cluster-reporting', PageClusterReporting);
export { PageClusterReporting as PageClusterReportingEl };
