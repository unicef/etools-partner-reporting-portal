var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import { getDomainByEnv } from '../../../../../config';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
*/
class ResponseParametersPartnersRouter extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <iron-location></iron-location>

    <app-route
        route="{{parentRoute}}"
        pattern="/:page"
        data="{{parentRouteData}}"
        tail="{{route}}">
    </app-route>

    <iron-pages
        selected="[[page]]"
        attr-for-selected="name">
      <template is="dom-if" if="[[_equals(page, 'projects')]]" restamp="true">
        <rp-partners-projects
          name="projects">
        </rp-partners-projects>
      </template>

      <template is="dom-if" if="[[_equals(page, 'project')]]" restamp="true">
        <rp-partners-project-detail
          name="project"
          parent-route="{{route}}">
        </rp-partners-project-detail>
      </template>

      <template is="dom-if" if="[[_equals(page, 'activities')]]" restamp="true">
        <rp-partners-activities
          name="activities">
        </rp-partners-activities>
      </template>

      <template is="dom-if" if="[[_equals(page, 'activity')]]" restamp="true">
        <rp-partners-activity-detail
          name="activity"
          parent-route="{{route}}">
        </rp-partners-activity-detail>
      </template>
    </iron-pages>
    `;
    }
    static get observers() {
        return [
            '_routeChanged(parentRouteData.page)'
        ];
    }
    _routeChanged(page) {
        this._routeChangeDebouncer = Debouncer.debounce(this._routeChangeDebouncer, timeOut.after(250), async () => {
            if (!page) {
                page = 'projects';
            }
            this.set('page', page);
            const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/cluster-reporting/response-parameters/partners/${page}.js`;
            console.log('cluster response-parameters partners router loading... :' + resolvedPageUrl);
            await import(resolvedPageUrl)
                .catch((err) => {
                console.log(err);
                this._notFound();
            });
        });
    }
}
__decorate([
    property({ type: String })
], ResponseParametersPartnersRouter.prototype, "page", void 0);
window.customElements.define('response-parameters-partners-router', ResponseParametersPartnersRouter);
export { ResponseParametersPartnersRouter as ResponseParametersPartnersRouterEl };
