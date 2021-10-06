var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PolymerElement, html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import './pd-details';
import './pd-report';
import UtilsMixin from '../../../../etools-prp-common/mixins/utils-mixin';
import { getDomainByEnv } from '../../../../etools-prp-common/config';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
class PageIpReportingPdRouter extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <app-route route="{{route}}" pattern="/:tree" data="{{routeData}}" tail="{{subroute}}"> </app-route>

      <iron-pages selected="[[page]]" attr-for-selected="name">
        <template is="dom-if" if="[[_equals(page, 'pd-details')]]" restamp="true">
          <page-ip-reporting-pd-details name="pd-details" route="{{subroute}}"> </page-ip-reporting-pd-details>
        </template>

        <template is="dom-if" if="[[_equals(page, 'pd-report')]]" restamp="true">
          <page-ip-reporting-pd-report name="pd-report" route="{{subroute}}"> </page-ip-reporting-pd-report>
        </template>
      </iron-pages>
    `;
    }
    static get observers() {
        return ['_routeTreeChanged(routeData.tree)'];
    }
    _routeTreeChanged(tree) {
        switch (tree) {
            case 'view':
                this.page = 'pd-details';
                break;
            case 'report':
                this.page = 'pd-report';
                break;
            default:
                this.page = 'pd-details';
                break;
        }
    }
    async _pageChanged(page) {
        if (!page) {
            return;
        }
        const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/ip-reporting/pd/${page}.js`;
        await import(resolvedPageUrl).catch((err) => {
            console.log(err);
            this._notFound();
        });
    }
}
__decorate([
    property({ type: String, observer: '_pageChanged' })
], PageIpReportingPdRouter.prototype, "page", void 0);
__decorate([
    property({ type: String })
], PageIpReportingPdRouter.prototype, "pdId", void 0);
window.customElements.define('page-ip-reporting-pd-router', PageIpReportingPdRouter);
