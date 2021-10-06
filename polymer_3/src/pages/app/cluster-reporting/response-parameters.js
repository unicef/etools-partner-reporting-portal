var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../mixins/utils-mixin';
import { getDomainByEnv } from '../../../config';
/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReportingResponseParameters extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <app-route
      route="{{route}}"
      pattern="/:page"
      data="{{routeData}}"
      tail="{{subroute}}">
    </app-route>

    <iron-pages
      selected="{{page}}"
      attr-for-selected="name">
        <template is="dom-if" if="[[_equals(page, 'clusters')]]" restamp="true">
          <clusters-response-parameters
            name="clusters"
            route="{{subroute}}">
          </clusters-response-parameters>
        </template>

        <template is="dom-if" if="[[_equals(page, 'partners')]]" restamp="true">
          <partners-response-parameters
            name="partners"
            route="{{subroute}}">
          </partners-response-parameters>
      </template>

    </iron-pages>
`;
    }
    static get observers() {
        return [
            '_routeChanged(routeData.page)'
        ];
    }
    _routeChanged(page) {
        if (!page) {
            setTimeout(() => {
                if (!this.visible) {
                    return;
                }
                this.set('route.path', '/clusters');
            });
        }
        else if (page !== this.page) {
            this.page = page;
        }
    }
    async _pageChanged(page) {
        if (!page) {
            return;
        }
        const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/cluster-reporting/response-parameters/${page}/${page}.js`;
        console.log('cluster response-parameters loading... :' + resolvedPageUrl);
        await import(resolvedPageUrl).catch((err) => {
            console.log(err);
            this._notFound();
        });
    }
    connectedCallback() {
        super.connectedCallback();
        this.set('visible', true);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.set('visible', false);
    }
}
__decorate([
    property({ type: Boolean })
], PageClusterReportingResponseParameters.prototype, "visible", void 0);
__decorate([
    property({ type: String, observer: '_pageChanged' })
], PageClusterReportingResponseParameters.prototype, "page", void 0);
window.customElements.define('page-cluster-reporting-response-parameters', PageClusterReportingResponseParameters);
