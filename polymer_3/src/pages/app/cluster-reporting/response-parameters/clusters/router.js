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
/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
*/
class ResponseParametersClustersRouter extends UtilsMixin(PolymerElement) {
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }
    </style>

    <iron-location></iron-location>

    <app-route
      route="{{route}}"
      pattern="/:id"
      data="{{routeData}}"
      tail="{{subroute}}">
    </app-route>

    <iron-pages
        selected="[[page]]"
        attr-for-selected="name">
      <template is="dom-if" if="[[_equals(page, 'objectives')]]" restamp="true">
        <clusters-objectives
          name="objectives"
          route="{{subroute}}">
        </clusters-objectives>
      </template>

      <template is="dom-if" if="[[_equals(page, 'objective')]]" restamp="true">
        <clusters-objective-details
          name="objective"
          objective-id="{{id}}"
          route="{{subroute}}">
        </clusters-objective-details>
      </template>

      <template is="dom-if" if="[[_equals(page, 'activities')]]" restamp="true">
        <clusters-activities
          name="activities"
          route="{{subroute}}">
        </clusters-activities>
      </template>

      <template is="dom-if" if="[[_equals(page, 'activity')]]" restamp="true">
        <clusters-activity-details
          name="activity"
          activity-id="{{id}}"
          route="{{subroute}}">
        </clusters-activity-details>
      </template>

      <template is="dom-if" if="[[_equals(page, 'disaggregations')]]" restamp="true">
        <clusters-disaggregations
          name="disaggregations"
          route="{{subroute}}">
        </clusters-disaggregations>
      </template>

    </iron-pages>
    `;
    }
    static get observers() {
        return [
            '_routeChanged(routeData.id)'
        ];
    }
    _routeChanged(id) {
        this.set('id', id);
    }
    async _pageChanged(page) {
        if (!page) {
            return;
        }
        if (!this.visible) {
            return;
        }
        const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/cluster-reporting/response-parameters/clusters/${page}.js`;
        console.log('cluster response-parameters clusters router loading... :' + resolvedPageUrl);
        await import(resolvedPageUrl)
            .catch((err) => {
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
    property({ type: Object })
], ResponseParametersClustersRouter.prototype, "routeData", void 0);
__decorate([
    property({ type: String })
], ResponseParametersClustersRouter.prototype, "id", void 0);
__decorate([
    property({ type: Boolean })
], ResponseParametersClustersRouter.prototype, "visible", void 0);
__decorate([
    property({ type: String, observer: '_pageChanged' })
], ResponseParametersClustersRouter.prototype, "page", void 0);
window.customElements.define('response-parameters-clusters-router', ResponseParametersClustersRouter);
export { ResponseParametersClustersRouter as ResponseParametersClustersRouterEl };
